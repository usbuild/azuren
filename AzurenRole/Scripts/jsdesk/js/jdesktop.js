/* Virtual Desktop system*/
var nJDSK = (function (wnd, d, $) {
    var fake = true;
    return {
        /*These settings can be changed*/
        taskbarHeight: 30,
        widgetWidth: 200,
        iconWidth: 96,
        iconMaxHeight: 128,
        iconMargin: 10,
        iconBorderWeight: 2,
        desktopHeight: 0,
        desktopWidth: 0,

        /**
         * A window list object (This stores window instances, and several other variables)
         */
        WindowList: {
            items: {},
            lastZIndex: 1000,
            left: 10,
            top: 10,

            get_top: function () {
                var b = null;
                for (var i in this.items) {
                    var obj = this.items[i];
                    if (obj.$base.is(":visible") && (b == null || obj.$base.css("z-index") > b.$base.css("z-index"))) {
                        b = obj;
                    }
                }
                return b;
            },
            add_item: function (id, win_object) {
                this.items[id] = win_object;
            },
            delete_item: function (id) {
                this.get_window(id).onClose();
                delete this.items[id];
            },
            get_window: function (id) {
                return this.items[id];
            }
        },

        /**
         * The heart of the system: the Window class
         * @param int width // window width
         * @param int height // window height
         * @param string title // window title, can contain HTML string
         * @param string toolbar // window toolbar, should contain HTML string, or empty
         * @param string content // window content, HTML
         * @param string id // window id
         * @param bool dialog // creates dialog style window (not resizable)
         * @param bool modal // creates a modal window (no access to other desktop elements)
         * @param bool fullGlass // the content area has no border and is transparent (aka windows 7 windows with translucent client area, such as media player)
         * @param function createCallback //a function to call after window creation
         */
        Window: function (width, height, title, content, id, callback) {
            var self = this;
            var desktop = nJDSK.desktop;
            var taskbar = $("#taskbarbuttons");

            this.setActive = function () {
                $(".win-active").removeClass("win-active");
                $(".activetsk").removeClass("activetsk");
                $(".iframe-window-mask").show();
                self.$base.find(".iframe-window-mask").hide();
                self.$base.addClass("win-active");
                self.unnotify();
                self.$taskbarBtn.addClass("activetsk");
                taskbar.scrollTo(self.$taskbarBtn, 'fast');
            };
            var setTopActive = function () {
                var top = nJDSK.WindowList.get_top();
                if (top) {
                    top.setActive();
                }
            };



            /*
             * Provide basic cascading on window creation
             */
            this.id = id;

            if ((nJDSK.WindowList.left + 25 + parseInt(width)) > $(wnd).width()) {
                nJDSK.WindowList.left = 10;
            } else {
                nJDSK.WindowList.left += 25;
            }

            if (nJDSK.WindowList.top + 25 + parseInt(height) > ($(wnd).height() - nJDSK.taskbarHeight)) {
                nJDSK.WindowList.top = 10;
            } else {
                nJDSK.WindowList.top += 25;
            }

            /*
             * Temporary dimensions/screen location storage
             * */
            var l = nJDSK.WindowList.left;
            var t = nJDSK.WindowList.top;
            var w = width;
            var h = height;

            /*
             * Update the task bar button status
             * */
            this.selector = "#win_" + id + " ";

            var obj = nJDSK.WindowList.get_window(id);
            if (obj) {
                obj['isNew'] = false;
                obj.$base.css({ 'z-index': nJDSK.WindowList.lastZIndex }).show();
                this.setActive();
                nJDSK.WindowList.lastZIndex += 1;
                if (typeof callback == 'function') {
                    callback(obj);
                }
                return obj;
            } else {
                this['isNew'] = true;
            }

            //this['selector'] = '#win_' + id + ' .contentarea';
            /*
             * Create the window base div (this will carry all the contents of the window, and also it's id)
             * 
             * */
            nJDSK.clearActive();

            this.$base = $("<div/>");
            desktop.append(this.$base);
            this.$base.css({
                'position': 'absolute',
                'top': nJDSK.WindowList.top + 'px',
                'left': nJDSK.WindowList.left + 'px',
                'width': width + 'px',
                'height': height + 'px',
                'z-index': nJDSK.WindowList.lastZIndex
            });

            this.onClose = function () { };

            this.isActive = function () {
                return self.$base.hasClass("win-active");
            };

            this.unnotify = function () { };

            /*
             * Increase last Z index
             * */
            nJDSK.WindowList.lastZIndex += 1;

            /*
             * set up attributes, parts and skinning for the window
             * */
            this.$base.addClass('window').attr('id', 'win_' + id);

            /*title bar*/
            this.$titlebar = $("<div/>");
            this.$base.append(this.$titlebar);
            this.$titlebar.addClass('titlebar').css({ 'cursor': 'default' });

            /*title bar text area*/
            this.$titleText = $("<span/>");
            this.$titlebar.append(this.$titleText);
            this.$titleText.html(title);

            /*title buttons container*/
            this.$titleButtons = $("<div/>");
            this.$titlebar.append(this.$titleButtons);
            this.$titleButtons.addClass('titlebuttons');

            /*minimize button*/
            this.$minimizeBtn = $("<a />");
            this.$titleButtons.append(this.$minimizeBtn);
            this.$minimizeBtn
                .attr('href', '#')
                .html('').addClass('minimizebtn')
                .click(function () {
                    self.$base.hide();
                    setTopActive();
                });

            /*maximize button*/
            this.$maximizeBtn = $("<a>");
            this.$titleButtons.append(this.$maximizeBtn);
            this.$maximizeBtn.attr('href', '#').html('').addClass('maximizebtn')
                .click(function () {
                    self.$base.addClass('transitioner');
                    if (self.$base.outerWidth() == desktop.width() && self.$base.outerHeight() == desktop.height()) {
                        self.$base.animate({ 'width': w, 'height': h, 'left': l, 'top': t }, 0, function () {
                            self.$base.removeClass('transitioner');
                            self.$content.css({
                                'height': self.$base.height() - self.$titlebar.height() - 2
                            });
                        });
                    } else {
                        self.$base.addClass('transitioner');
                        w = self.$base.css('width');
                        h = self.$base.css('height');
                        l = self.$base.css('left');
                        t = self.$base.css('top');
                        self.$base.animate({ 'width': desktop.width(), 'height': desktop.height(), 'left': 0, 'top': 0 }, 0, function () {
                            self.$base.removeClass('transitioner');
                            self.$content.css({
                                'height': self.$base.height() - self.$titlebar.height() - 2
                            });
                        });
                    }

                });

            /* maximize/restore on title bar doubleclick */
            this.$titlebar.dblclick(function () {
                self.$maximizeBtn.trigger("click");
            });

            /*close button - always visible*/
            this.$closeBtn = $("<a />");
            this.$titleButtons.append(this.$closeBtn);
            self.$closeBtn.attr('href', '#')
                .html('')
                .addClass('closebtn')
                .click(function () {
                    /*this line with tinymce should be removed, if you aren't using tinyMCE, as it will cause an error*/
                    self.$base.fadeOut('fast', function () {
                        self.$base.remove();
                        setTopActive();
                    });
                    self.$taskbarBtn.hide('fast', function () {
                        $(this).remove();
                    });

                    /*unregister this window instance*/
                    nJDSK.WindowList.delete_item(id);
                });



            /*make the window resizable, and draggable and add resize handle+drag behaviors*/
            /*
                   $(wnd).resize(function(){
                       self.$base.draggable({handle:self.$titlebar}).resizable();
                   });
                   */

            /*make the window draggable all around the screen*/
            this.$base.draggable({
                handle: self.$titlebar
                , start: function () { $(".ui-mask-layer").show(); }
                , stop: function () { $(".ui-mask-layer").hide(); }
            });
            this.$base.resizable({
                containment: "parent"
                , start: function () { $(".ui-mask-layer").show(); }
                , stop: function () { $(".ui-mask-layer").hide(); }
            });

            /*show the base div*/
            this.$base.fadeIn();

            /*add close function - for the window be removable from outside*/
            this.close = function () {
                self.$base.fadeOut('fast', function () {
                    self.$base.remove();
                    setTopActive();
                });
                self.$taskbarBtn.hide('fast', function () {
                    self.$taskbarBtn.remove();
                });
                /*unregister this window instance*/
                nJDSK.WindowList.delete_item(id);
            }

            // create the taskbar button
            this.$taskbarBtn = $("<div />");
            this.$taskbarBtn.attr('id', 'tskbrbtn_' + id)
                .html(title)
                .addClass('taskbarbutton');
            taskbar.append(this.$taskbarBtn);

            // add taskbar button behavior
            this.$taskbarBtn.click(function () {
                if (self.$taskbarBtn.hasClass('activetsk') && self.$base.is(':visible')) {
                    self.$base.hide().removeClass("win-active");
                    setTopActive();
                } else {
                    self.$base.css({ 'z-index': nJDSK.WindowList.lastZIndex });
                    nJDSK.WindowList.lastZIndex += 1;
                    self.$base.show();
                    self.setActive();
                }
            });

            // add window behavior on activation
            self.$base.mousedown(function () {
                // reveal taskbar button if it's outside the visible taskbar area

                self.$base.css({ 'z-index': nJDSK.WindowList.lastZIndex });
                nJDSK.WindowList.lastZIndex += 1;
                self.setActive();
            });

            // add content area this will hold all the stuff
            this.$content = $("<div>");
            this.$base.append(this.$content);
            // set up contentarea look and feel
            this.$content.addClass('contentarea');

            this.$content.css({
                'height': self.$base.height() - self.$titlebar.height() - 2
            });


            // insert the content
            this.$content.html(content);

            /*
             * window behavior on resize
             * */
            this.$base.resize(function () {
                self.$content.css({
                    'height': self.$base.height() - self.$titlebar.height() - 2
                });

            });

            // arbitrary resize through program
            this.setDimensions = function (left, top, width, height) {
                self.$base.css({ "left": left + 'px', "top": top + 'px', 'width': (width - 10) + 'px', 'height': (height - 10) + 'px' }).resize();
            }



            /*facility to change title from outside*/
            this.setTitle = function (ititle) {
                this.$taskbarBtn.html(ititle);
                this.$titleText.html(ititle);
            }

            // facility to make a window unclosable
            this.noClose = function () {
                self.$base.find('a.closebtn').remove();
            }

            //register the window object and store array index
            this.index = nJDSK.WindowList.add_item(id, this);

            // run callback upon window creation
            if (typeof callback == 'function') {
                callback(this);
            }
            self.setActive();
            if (self.$base.find("iframe").length > 0) {
                var iframe = self.$base.find("iframe").get(0);
                
                if (navigator.userAgent.indexOf("MSIE") > -1 && !window.opera) {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            self.$base.find(".iframe-window-start").hide();
                            self.$content.trigger("ready");
                        }
                    };
                } else {
                    iframe.onload = function () {
                        self.$base.find(".iframe-window-start").hide();
                        self.$content.trigger("ready");
                    };
                }
                iframe.onerror = function () {
                    self.$base.find(".iframe-window-error").show();
                };
            }
            return this;
        },

        frameWindow: function (id, title, src, width, height, callback, args) {
            var html = '<div class="iframe-window-start" ><div class="iframe-window-error" /></div><iframe data-id="'+id+'"src="' + src + '" class="win-frame"></iframe><div class="iframe-window-mask" />';
            var win = new nJDSK.Window(width + 12, height + 35, title, html, id, function (e) {
                if (e.isNew) {
                    callback(e);
                }
            });
            return win;
        },

        /**
         * Generate a unique id for windows
         */
        uniqid: function () {
            var newDate = new Date;
            return newDate.getTime();
        },


        iconHelper: {
            /**
             * Add icon
             * @param string iconId		the id for the new icon
             * @param string iconTitle	the icon title
             * @param string iconImage	url for icon image
             * @param function callback	click function
             */
            addIcon: function (iconId, iconTitle, iconImage, callback) {

                nJDSK.gridster.add_widget('<li><a class="icon" id="' + iconId + '" ><img src="' + iconImage + '" /><span>' + iconTitle + '</span></a></li>');

                if (typeof (callback) == 'function') {
                    $('#' + iconId).click(
                        function (e) {
                            if (fake) {
                                return callback(e);
                            }
                        });
                }

                var icn = $('#' + iconId);
                icn.mousedown(function (e) {
                    nJDSK.clearActive();
                    icn.addClass('activeIcon');
                });

                icn.click(function (e) {
                    e.stopPropagation();
                });
            },

            /**
             * Deletes selected icon
             * @param string iconId	The icon ID
             */
            removeIcon: function (iconId) {
                nJDSK.gridster.remove_widget($('#' + iconId));
            }
        },

        /**
         * idea borrowed From JQuery Desktop http://desktop.sonspring.com/
         * Sets background image for the Desktop environment - can be called at any time
         * @param string bgimage //the background image we wish to use
         */
        setBackground: function (bgimage) {
            $('#nJDSKBG').remove();
            $('body').prepend('<img id="nJDSKBG" src="' + bgimage + '" />');
        },

        /**
         * idea borrowed From JQuery Desktop http://desktop.sonspring.com/
         * Clears selection
         */
        clearActive: function () {
            $('.activeIcon').removeClass('activeIcon');
        },

        /**
         * Put desktop system together
         */
        desktop: $("#desktop"),
        widgets: $("#widgets"),
        taskbar: $("#taskbarbuttons"),
        icons: $("#desktop_iconarea"),
        gridster: null,
        init: function () {
            $(wnd).resize(function () {
                nJDSK.desktopWidth = $(wnd).width();
                nJDSK.desktopHeight = $(wnd).height() - nJDSK.taskbarHeight;
                nJDSK.desktop.css({ "height": (nJDSK.desktopHeight) + 'px', "width": nJDSK.desktopWidth + 'px', "top": '0' });
                nJDSK.widgets.css({ "height": $('#desktop').height() + 'px', 'top': '0' });
            });

            nJDSK.taskbar.css({ "height": nJDSK.taskbarHeight + 'px' });
            nJDSK.widgets.css({ "width": nJDSK.widgetWidth + 'px' });
            nJDSK.desktop.click(function (e) {
                nJDSK.clearActive(e);
            });
            $(wnd).resize();

            // taken from JQuery Desktop http://desktop.sonspring.com/
            $(d).on('click', 'a', function (e) {
                var url = $(this).attr('href');
                if (url.match(/^#/)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                else {
                    $(this).attr('target', '_blank');
                }

            });

            // Show/hide windows on desktop
            $('a#showdesktop').click(function (e) {
                nJDSK.clearActive();
                if ($('.window').is(':visible')) {
                    $('.window').hide();
                } else {
                    $('.window').show();
                }
            });

            nJDSK.gridster = nJDSK.icons.gridster({
                widget_margins: [nJDSK.iconMargin, nJDSK.iconMargin],
                widget_base_dimensions: [100, 120],
                autogenerate_stylesheet: true,
                draggable: {
                    stop: function () {
                        setTimeout(function () { fake = true; }, 10);
                        $(".ui-mask-layer").hide();
                    },
                    start: function () {
                        fake = false;
                        $(".ui-mask-layer").show();
                    }
                }
            }).data("gridster");
        }
    }

})(window, document, jQuery);

(function (wnd, d, $) {
    $.extend(nJDSK.widgets, {
        /**
		 * Adds a new widget
		 * @param string wdgId 			widget id
		 * @param string wdgTitle 		widget title
		 * @param string wdgContent		widget content
		 * @param function wdgFunction	widget init function (can implement widget behavior)
		 */
        addItem: function (wdgId, url, width, height) {
            var item = $('<div id="' + wdgId + '" class="widget"><div class="widget-title">' +
	            '<span class="glyphicon glyphicon-remove wdg-close"></span>' +
	            '<span class="glyphicon glyphicon-th wdg-move"></span>' +
	            '</div><div class="widget-content"><iframe frameborder="0" src="' + url + '" style="width:' + width + 'px;height:' + height + 'px"></iframe></div></div>').addClass("ui-draggable");
            $('#widgets').append(item);
            item.draggable({
                handle: ".widget-title .wdg-move"
            });
            item.find(".wdg-close").click(function (e) {
                item.remove();
            });
            item.hover(function (parameters) {
                item.find(".widget-title").css("visibility", "visible");
            }, function () {
                item.find(".widget-title").css("visibility", "hidden");
            });

        }
    });
})(window, document, jQuery);
