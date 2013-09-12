(function ($) {
    $.fn.flip = function (options) {
        var defaults = {
            method: "show",
            time: 300,
            direction: "left",
            callback: function () {
            }
        };
        var settings = $.extend({}, defaults, options);

        var ele = this;
        var origin, start, end;
        if (settings.direction === "left") {
            origin = "left center";
            start = "rotateY(0deg)";
            end = "rotateY(90deg)";
        } else if (settings.direction === "right") {
            origin = "right center";
            start = "rotateY(0deg)";
            end = "rotateY(90deg)";
        } else if (settings.direction === "top") {
            origin = "center top";
            start = "rotateX(0deg)";
            end = "rotateX(90deg)";
        } else {
            origin = "center bottom";
            start = "rotateX(0deg)";
            end = "rotateX(90deg)";
        }

        if (settings.method == "show") {
            this.css("-webkit-transform-origin", origin)
                .css("transform-origin", origin)
                .css("transition", 'all 0')
                .css("-webkit-transition", 'all 0')
                .css("-webkit-transform", end)
                .css("transform", end)
                .show(0)
                .css("transition", 'transform ' + settings.time + 'ms')
                .css("-webkit-transition", '-webkit-transform ' + settings.time + 'ms')
                .attr('data-trans', "show")
            ;


            setTimeout(function () {
                ele.css("-webkit-transform", "perspective(10000) " + start)
                    .css("transform", "perspective(10000px) " + start);
                ele.show(0);

            }, 0);

            setTimeout(function () {
                settings.callback(ele);
            }, settings.time);
        } else {
            this.css("-webkit-transform-origin", origin)
            .css("transform-origin", origin)
                .css("transition", 'transform ' + settings.time + 'ms')
                .css("-webkit-transition", '-webkit-transform ' + settings.time + 'ms')
            .attr('data-trans', "hide")
            ;
            setTimeout(function () {
                ele.css("-webkit-transform", "perspective(10000) " + end)
                    .css("transform", "perspective(10000px) " + end);
            }, 0);
            setTimeout(function () {
                settings.callback(ele);
            }, settings.time);
        }


    };
})(jQuery);

/* Virtual Desktop system*/
var nJDSK = (function (wnd, d, $) {
    var fake = true;
    return {
        /*These settings can be changed*/
        taskbarHeight: 42,
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

        metroList: {
            items: {},
            lastZIndex: 1000,

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

        MetroWindow: function (id, title, icon, content, callback) {
            var identifier = "metro-win-" + id;
            var selector = "#" + identifier;
            var self = this;
            self.$base = $(selector);


            var themes = ["darkgreen", "blue", "orange", "red", "darkred", "green", "purple", "yellow", "grey"];
            var theme = themes[Math.floor(Math.random() * themes.length)];

            var showMetroDesktop = function () {
                $("#metro-desktop").flip({
                    method: "show",
                    direction: "top"
                });
            };
            self.show = function () {
                self.$base.css("z-index", nJDSK.metroList.lastZIndex);
                nJDSK.metroList.lastZIndex++;
                self.$base.flip({
                    method: "show",
                    direction: "top"
                });
            };

            self.hide = function (quick) {
                if (quick) {
                    self.$base.hide(0);
                } else {
                    self.$base.css("z-index", nJDSK.metroList.lastZIndex);
                    nJDSK.metroList.lastZIndex++;
                    self.$base.flip({
                        method: "hide",
                        direction: "top"
                    });
                }
            };

            if (self.$base.length > 0) {
                self = nJDSK.metroList.get_window(id);
                self.isNew = false;
                showMetroDesktop();
                self.show();
                callback(self);
                return self;
            }

            self.onClose = function () {
            };

            self.$base = $("<div/>").addClass("metro-win").css("z-index", nJDSK.metroList.lastZIndex).attr("id", identifier).addClass("widget_" + theme);
            self.$base.attr("data-id", id);
            self.$content = $("<div>").addClass("metro-content");
            self.$content.html(content);
            self.$base.append(self.$content);
            self.onAppBar = function () {
            };
            self.$base.bind("appbar", function (e, data) {
                self.onAppBar(data);
            });

            nJDSK.metroList.lastZIndex++;
            self.isNew = true;
            if (!$("#metro-desktop").is(":visible")) {
                showMetroDesktop();
            }
            self.close = function () {
                self.$appbar.remove();
                self.$task.hide(function () { self.$task.remove(); });
                self.$base.remove();
                nJDSK.metroList.delete_item(id);
            };

            self.$task = $("<div/>")
                .append($("<div>").addClass("main").css("background-image", 'url("' + icon + '")'))
                .addClass("metro-task")
                .addClass("widget_" + theme)
                .attr("data-id", id)
                .appendTo($("#metro-taskbar"));
            self.$task.append($('<div class="metro-close glyphicon glyphicon-remove-circle"></div>'));
            self.$task.find(".metro-close").click(function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                if ($(".metro-win").length == 1) {
                    $("#metro-desktop").flip({
                        method: "hide",
                        direction: "top",
                        callback: function (e) {
                            e.hide();
                            self.close();
                        }
                    });

                    $("#start-screen").flip({
                        method: "show",
                        direction: "bottom",
                        callback: function (e) {
                            $("#start-screen .widget").each(function (a, b) {
                                $(b).css("transform", "scale(0.9)");
                                setTimeout(function () { $(b).fadeIn("fast"), $(b).css("transform", "scale(1)") }, $(b).data("col") * 60 + $(b).data("row") * 30);
                            });
                        }
                    });
                } else {
                    self.$base.flip({
                        method: "hide",
                        direction: "bottom",
                        callback: function () {

                            self.close();
                        }
                    });
                }

            });

            self.$task.click(function () {
                if (self.$base.css("z-index") == nJDSK.metroList.lastZIndex - 1 && self.$base.is(":visible")) {
                } else {
                    self.show();
                }

            });
            self.$appbar = $("<footer>").addClass("appbar");
            self.$appbar.appendTo(self.$base);
            var winmain = $("#metro-winmain");
            winmain.append(self.$base);
            nJDSK.metroList.add_item(id, self);


            if (self.$base.find("iframe.metro-frame").length > 0) {
                self.$content.css("overflow", "hidden")
                var iframe = self.$base.find("iframe.metro-frame").get(0);

                if (navigator.userAgent.indexOf("MSIE") > -1 && !window.opera) {
                    iframe.onreadystatechange = function () {
                        if (iframe.readyState == "complete") {
                            self.$content.trigger("ready");
                        }
                    };
                } else {
                    iframe.onload = function () {

                        self.$content.trigger("ready");
                    };
                }
                iframe.onerror = function () {
                    self.$base.find(".iframe-window-error").show();
                };
            }


            callback && callback(self);
        },

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
                self = obj;
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

            this.onClose = function () {
            };

            this.isActive = function () {
                return self.$base.hasClass("win-active");
            };

            this.unnotify = function () {
            };

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
                    self.$base.hide().removeClass("win-active");
                    setTopActive();
                });

            /*maximize button*/
            this.$maximizeBtn = $("<a>");
            this.$titleButtons.append(this.$maximizeBtn);
            this.$maximizeBtn.attr('href', '#').html('').addClass('maximizebtn')
                .click(function () {
                    self.$base.addClass('transitioner');
                    if (self.$base.outerWidth() == desktop.width() && self.$base.outerHeight() == desktop.height()) {
                        self.$base.animate({ 'width': w, 'height': h, 'left': l, 'top': t }, 100, function () {
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
                        self.$base.animate({ 'width': desktop.width(), 'height': desktop.height(), 'left': 0, 'top': 0 }, 100, function () {
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
                handle: self.$titlebar,
                start: function () { $(".ui-mask-layer").show(); },
                stop: function () { $(".ui-mask-layer").hide(); }
            });
            this.$base.resizable({
                containment: "parent",
                start: function () { $(".ui-mask-layer").show(); },
                stop: function () { $(".ui-mask-layer").hide(); }
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

                .addClass('taskbarbutton');

            if (nJDSK.iconList[id]) {
                this.$taskbarBtn.
                css("background-image", 'url("' + nJDSK.iconList[id].image + '")');
            }
            taskbar.append(this.$taskbarBtn);

            this.setTaskbarBtn = function(url) {
                this.$taskbarBtn.
                css("background-image", 'url("' + url + '")');
            };

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
            if (self.$base.find("iframe.win-frame").length > 0) {
                var iframe = self.$base.find("iframe.win-frame").get(0);

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
            var html = '<div class="iframe-window-start" ><div class="iframe-window-error" /></div><iframe data-id="' + id + '"src="' + src + '" class="win-frame"></iframe><div class="iframe-window-mask" />';
            var win = new nJDSK.Window(width + 12, height + 35, title, html, id, function (e) {
                if (e.isNew) {
                    callback(e);
                }
            });
            return win;
        },

        metroFrameWindow: function (id, title, src, icon, callback) {
            var html = '<div class="iframe-window-error" /><iframe data-id="' + id + '" src="' + src + '" class="metro-frame"></iframe>';
            var win = new nJDSK.MetroWindow(id, title, icon, html, function (win) {
                if (win.isNew) {
                    callback && callback(win);
                }
            });
        },

        /**
         * Generate a unique id for windows
         */
        uniqid: function () {
            var newDate = new Date;
            return newDate.getTime();
        },
        iconList: {},

        iconHelper: {
            /**
             * Add icon
             * @param string iconId		the id for the new icon
             * @param string iconTitle	the icon title
             * @param string iconImage	url for icon image
             * @param function callback	click function
             */
            addIcon: function (iconId, iconTitle, iconImage, iconWidth, iconHeight, type, tile, callback) {

                nJDSK.iconList[iconId + ""] = { image: iconImage, title: iconTitle };

                var themes = ["amber", 'blue', 'brown', 'cobalt', 'crimson', 'cyan', 'emerald', 'green', 'indigo', 'lime', 'magenta', 'mango', 'mauve', 'olive', 'orange', 'pink', 'purple', 'violet', 'red',
                'sienna', 'steel', 'teal', 'yellow'];
                var theme = themes[Math.floor(Math.random() * themes.length)];

                var x = iconWidth,
                    y = iconHeight;
                var metroIcon = $(['<li class="live-tile widget ', theme, '" data-id=', iconId, ' id="metro-icon-', iconId, '" data-sizex="', x, '" data-sizey="', y, '">',
                    '<span class="tile-title">', iconTitle, '</span>',
                    '<div><img class="full" src="', iconImage, '" width="110" height="110"/></div>',
                    '</li>'].join(""));
                metroIcon.find("img").css("margin-top", 10 + 90 * (y - 1) + "px");
                metroIcon.data("info", { id: iconId, image: iconImage, title: iconTitle });

                metroIcon.mousedown(function (e) {
                    $(this).addClass("widget-press");
                }).mouseup(function (e) {
                    $(this).removeClass("widget-press");
                });
                var app = {};
                app.tile = metroIcon;

                nJDSK.metroster.add_widget(metroIcon, x, y);

                /*
                nJDSK.gridster.add_widget('<li><a class="icon app-icon" data-id="' + iconId + '" id="app-icon-' + iconId + '" ><img src="' + iconImage + '" /><span>' + iconTitle + '</span></a></li>');
                */
                if (typeof (callback) == 'function') {

                    metroIcon.
                        click(function (e) {
                            if (fake) {
                                if (type == 0) {
                                    nJDSK.showDesktop();
                                    return callback(e);
                                } else {

                                    $("#start-screen").flip({
                                        method: "hide",
                                        direction: "bottom"
                                    });

                                    if (nJDSK.metroList.get_window(iconId)) {
                                        callback(app);
                                    } else {
                                        var m = $('<div class="metro-icon-transform">')
                                            .append($('<div class="main">').css("background-image", 'url("' + iconImage + '")'))
                                            .addClass("b-" + theme)
                                            .appendTo("body");

                                        m.flip({
                                            method: "show",
                                            callback: function (m) {
                                                app.ready = function () {
                                                    m.flip({
                                                        method: "hide",
                                                        direction: "right",
                                                        callback: function (m) {
                                                            m.remove();
                                                        }
                                                    });
                                                }
                                                callback(app);
                                            }
                                        });
                                    }

                                }
                            }
                        });
                }


                if (typeof tile === 'function') {
                    tile(app);
                } else if (typeof tile === 'string') {
                    var url = tile.trim();
                    if (url.length > 0) {
                        $.getScript(url);
                    }

                }
                return metroIcon;
            },

            /**
             * Deletes selected icon
             * @param string iconId	The icon ID
             */
            removeIcon: function (iconId) {
                nJDSK.metroster.remove_widget($("#metro-icon-" + iconId));
            }
        },

        /**
         * idea borrowed From JQuery Desktop http://desktop.sonspring.com/
         * Sets background image for the Desktop environment - can be called at any time
         * @param string bgimage //the background image we wish to use
         */
        setBackground: function (bgimage) {
            if ($('#nJDSKBG').length == 0) {
                $('#wrapper').prepend('<img id="nJDSKBG" src="' + bgimage + '" />');
            } else {
                var img = $("#nJDSKBG");
                if (img.attr("src") != bgimage) {
                    img.fadeTo("slow", 0.3, function () {
                        img.attr("src", bgimage).fadeTo("normal", 1);
                    });
                }

            }
        },

        /**
         * idea borrowed From JQuery Desktop http://desktop.sonspring.com/
         * Clears selection
         */
        clearActive: function () {
            $('.activeIcon').removeClass('activeIcon');
        },
        showDesktop: function () {
            if ($("#wrapper").attr("data-trans") === "hide" || $("#start-screen").attr("data-trans") == "show") {
                $("#wrapper").flip({
                    method: "show",
                    direction: "left"
                });
                $("#start-screen").flip({
                    method: "hide",
                    direction: "right",
                    callback: function () {
                    }
                });
            }
        },

        /**
         * Put desktop system together
         */
        desktop: $("#desktop"),
        widgets: $("#widgets"),
        taskbar: $("#taskbarbuttons"),
        icons: $("#desktop_iconarea"),
        gridster: null,
        metroster: null,
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
                if (url && url.match(/^#/)) {
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    //$(this).attr('target', '_blank');
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

            $("#start-menu").click(function () {
                $("#start-screen .widget").hide(0, function () {
                    $("#start-screen").flip({
                        method: "show",
                        direction: "right",
                        callback: function (e) {
                            $("#wrapper").flip({
                                method: "hide"
                            });
                            $("#start-screen .widget").each(function (a, b) {
                                $(b).css("transform", "scale(0.8)");
                                setTimeout(function () { $(b).fadeIn("fast"), $(b).css("transform", "scale(1)") }, $(b).data("col") * 80 + $(b).data("row") * 40);
                            });
                        }
                    });
                });
            });


            $("li.widget.desktop").mousedown(function (e) {
                $(this).addClass("widget-press");
            }).mouseup(function (e) {
                $(this).removeClass("widget-press");
            }).click(function (e) {
                if (fake) {
                    nJDSK.showDesktop();
                }
            });
            $("#left-showdesktop").click(function (e) {
                nJDSK.showDesktop();
            });
            $("#left-metrodesk").click(function (e) {
                $("#start-screen").flip({
                    method: "hide",
                    direction: "bottom",
                });
                $("#metro-desktop").flip({
                    method: "show",
                    direction: "top"
                });
            }).hover(function () {
                if ($(".metro-win").length > 0) {
                    $(this).addClass("show-metrodesk-hover");
                }
            }, function () {
                $(this).removeClass("show-metrodesk-hover");
            });


            $("#start-screen").scroll(function (e) {
                $("#start-screen>div:not(#widget_scroll_container)").css("left", $(this).scrollLeft());
            });
            var closeProfile = function () {
                $(".profile-setting").animate({ right: "-400px" }, 200, "easeInOutQuad", function () {
                    $(this).hide(0);
                    $("#start-screen").off("click", closeProfile);
                });
            };

            $(".start-profile").click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(".profile-setting").show(0);
                $(".profile-setting").find("iframe").get(0).contentWindow.location.reload();
                
                setTimeout(function () {
                    $(".profile-setting").animate({ right: 0 }, 400, "easeInOutQuad", function () {
                    });
                }, 200);
                $("#start-screen").on("click", closeProfile);

            });
            $(".profile-setting .close-profile").click(function (e) {
                $(".profile-setting").animate({ right: "-400px" }, 400, "easeInOutQuad", function () {
                    $(this).hide(0);
                });
            });

            $("#metro-taskbar").hover(function (e) {
            }, function (e) {

            });

            $("#metro-desktop .back").click(function (e) {
                $("#start-screen .widget").hide(0);
                $("#metro-desktop").flip({
                    method: "hide",
                    direction: "top",
                    callback: function (e) {
                        e.hide();
                    }
                });

                $("#start-screen").flip({
                    method: "show",
                    direction: "bottom",
                    callback: function (e) {
                        $("#start-screen .widget").each(function (a, b) {
                            $(b).css("transform", "scale(0.9)");
                            setTimeout(function () { $(b).fadeIn("fast"), $(b).css("transform", "scale(1)") }, $(b).data("col") * 60 + $(b).data("row") * 30);
                        });
                    }
                });

            });
            $(document).on("click", ".desktop-icon", function () {
                $("#metro-icon-" + $(this).data("id")).trigger("click");
            });

            nJDSK.metroster = $(".widget_container").gridster({
                widget_margins: [5, 5],
                widget_base_dimensions: [140, 140],
                autogenerate_stylesheet: true,
                namespace: ".widget_container",
                max_cols: 9,
                draggable: {
                    stop: function () {
                        setTimeout(function () { fake = true; }, 100);
                        $(".ui-mask-layer").hide(0);
                    },
                    start: function () {
                        fake = false;
                        $(".ui-mask-layer").show(0);
                    }
                }

            }).data("gridster");

            nJDSK.gridster = nJDSK.icons.gridster({
                widget_margins: [nJDSK.iconMargin, nJDSK.iconMargin],
                widget_base_dimensions: [100, 120],
                autogenerate_stylesheet: true,
                namespace: "#desktop_iconarea",
                max_cols: 7,
                draggable: {
                    stop: function () {
                        setTimeout(function () { fake = true; }, 10);
                        $(".ui-mask-layer").hide(0);
                    },
                    start: function () {
                        fake = false;
                        $(".ui-mask-layer").show(0);
                    }
                }
            }).data("gridster");


        }
    };

})(window, document, jQuery);
//metro

(function () {
    var a = {
        window_width: 0, window_height: 0, scroll_container_width: 0, widgets: null, widget_scroll_container: null, widget_containers: null,
        widget_open: !1, dragging_x: 0, left: 60, widget_page_data: [], is_touch_device: !1, init: function () {
            a.is_touch_device = "ontouchstart" in document.documentElement ? !0 : !1;
            a.cacheElements();
            a.Events.onWindowResize();
            $(window).bind("resize", a.Events.onWindowResize);
            a.is_touch_device ? $("#widget_scroll_container").addClass("touch") : $("#widget_scroll_container").mousedown(a.Events.onMouseDown).mouseup(a.Events.onMouseUp).mousemove(a.Events.onMouseMove);

        }, Events: {
            onWindowResize: function () {
                a.window_width = $(window).width();
                a.window_height = $(window).height()
                a.Events.onMouseUp();
            }, onMouseDown: function (b) {
                a.dragging_x = b.clientX;
            }, onMouseUp: function () {
                a.dragging_x = 0;

                $(document).scrollLeft(0);


                a.dragging_x = 0;
                var b = -1 * (a.scroll_container_width - a.window_width),
                    c = function () {
                        setTimeout(function () {
                            a.widget_scroll_container.css("transition", "")
                        }, 400)
                    };

                60 < a.left || a.scroll_container_width + 60 < a.window_width ?
                    (a.widget_scroll_container.css("transition", "left 0.2s ease-in"), a.widget_scroll_container.css("left", 60), a.left = 60, c()) :
                    a.left < b && (a.widget_scroll_container.css("transition", "left 0.2s ease-in"), a.widget_scroll_container.css("left", b), a.left = b, c())
            }, onMouseMove: function (b) {
                if (a.dragging_x) {
                    var c = a.left + b.clientX - a.dragging_x;
                    a.widget_scroll_container.css("left", c);
                    a.dragging_x = b.clientX;
                    a.left = c
                }
            },
        }, cacheElements: function () {
            a.widgets = $("div.widget");
            a.widget_containers = $("div.widget_container");
            a.widget_scroll_container = $("#widget_scroll_container");
            a.scroll_container_width = a.widget_scroll_container.width()
        }
    };
    $(document).ready(a.init)
})();



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
                handle: ".widget-title .wdg-move", start: function () { $(".ui-mask-layer").show(0); }
                , stop: function () { $(".ui-mask-layer").hide(0); }
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
