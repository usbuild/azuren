/* Virtual Desktop system*/
var nJDSK = (function(wnd,d,$){
    return{
        /*These settings can be changed*/
    taskbarHeight: 30,
    widgetWidth: 200,
    iconWidth:96,
    iconMaxHeight:128,
    iconMargin:10,
    iconBorderWeight:2,
    nextIconPos:{
        left:0,
        top:0
    },
    desktopHeight: 0,
    desktopWidth: 0,

    /**
     * A window list object (This stores window instances, and several other variables)
     */
    WindowList: {
        items:{},
        lastZIndex : 1000,
        left : 10,
        top: 10,

        get_top: function () {
            var b = null;
            for (var i in this.items) {
                var obj = this.items[i];
                if (obj.$base.is(":visible") && ( b == null ||obj.$base.css("z-index") > b.$base.css("z-index") )) {
                    b = obj;
                }
            }
            return b;
        },
        add_item:function(id,win_object) {
            this.items[id] = win_object;
        },
        delete_item:function(id) {
                        this.get_window(id).onClose();
                        delete this.items[id];
                    },
        get_window:function(id)
        {
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
    Window:function(width,height,title,toolbar,content,id,dialog,modal,fullGlass,createCallback){
               var self = this;
               var desktop = $("#desktop");
               /**
                * Restore standard content area
                */
               this.removeFullGlass = function()
               {
                   self.$content.removeClass('fullGlass');
               }

               /**
                * Turn content area backgrounds and borders transparent
                */
               this.setFullGlass = function()
               {
                   self.$content.addClass('fullGlass');
               }


               /*
                * Provide basic cascading on window creation
                */

               this.modal = modal;
               this.id = id;

                   if ((nJDSK.WindowList.left + 25 + parseInt(width)) > $(wnd).width()) {
                       nJDSK.WindowList.left = 10;
                   } else {
                       nJDSK.WindowList.left+=25;
                   }

                   if (nJDSK.WindowList.top+25+parseInt(height) > ($(wnd).height()-nJDSK.taskbarHeight)){
                       nJDSK.WindowList.top = 10;
                   } else {
                       nJDSK.WindowList.top+=25;
                   }

               /*
                * Temporary dimensions/screen location storage
                * */
               var l=nJDSK.WindowList.left;
               var t=nJDSK.WindowList.top;
               var w=width;
               var h=height;

               /*
                * Update the task bar button status
                * */
               this.selector = "#win_" + id +" ";

               var obj = nJDSK.WindowList.get_window(id);
               if(obj)  {
                   obj['isNew'] = false;
                   $('.taskbarbutton').removeClass('activetsk');
                   obj.$taskbarBtn.addClass('activetsk');
                   obj.$base.css({ 'z-index': nJDSK.WindowList.lastZIndex }).show();
                   nJDSK.WindowList.lastZIndex+=1;
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
                       'position':'absolute',
                       'top':nJDSK.WindowList.top+'px',
                       'left':nJDSK.WindowList.left+'px',
                       'width':width+'px',
                       'height':height+'px',
                       'z-index':nJDSK.WindowList.lastZIndex});

               this.onClose = function() { };

               this.isActive = function () {
                   return self.$base.hasClass("win-active");
               };

               this.unnotify = function() {
               };

               /*
                * Increase last Z index
                * */
               nJDSK.WindowList.lastZIndex+=1;

               /*
                * set up attributes, parts and skinning for the window
                * */
               this.$base.addClass('window').attr('id','win_'+id);

               /*title bar*/
               this.$titlebar = $("<div/>");
               this.$base.append(this.$titlebar);
               this.$titlebar.addClass('titlebar').css({'cursor':'default'});

               /*title bar text area*/
               this.$titleText = $("<span/>");
               this.$titlebar.append(this.$titleText);
               this.$titleText.html(title);

               /*title buttons container*/
               this.$titleButtons = $("<div/>");
               this.$titlebar.append(this.$titleButtons);
               this.$titleButtons.addClass('titlebuttons')

                   /*create title buttons depending on window type (dialog or not)*/
                       this.minMax = function(){ };
                       /*minimize button*/
                       this.$minimizeBtn = $("<a />");
                       this.$titleButtons.append(this.$minimizeBtn);
                       this.$minimizeBtn
                           .attr('href','#')
                           .html('').addClass('minimizebtn')
                           .click(function () {
                               $('#win_' + id).hide();

                               $(".win-active").removeClass("win-active");
                               var top = nJDSK.WindowList.get_top();
                               $(".activetsk").removeClass("activetsk");
                               if (top) {
                                   top.$base.addClass("win-active");
                                   top.unnotify();
                                   top.$taskbarBtn.addClass("activetsk");
                               }

                           });

                       /*maximize button*/
                       this.$maximizeBtn = $("<a>");
                       this.$titleButtons.append(this.$maximizeBtn);
                       this.$maximizeBtn.attr('href','#').html('').addClass('maximizebtn')
                           .click(function(){
                               self.$base.addClass('transitioner');  
                               if ((self.$base.outerWidth()==desktop.width()-10)&&(self.$base.outerHeight()==desktop.height()-10)){
                                   self.$base.animate({'width':w,'height':h,'left':l,'top':t},0,function()
                                       {
                                           self.$base.removeClass('transitioner').children('.contentarea').css({
                                               'height':self.$base.height()-self.$titlebar.height()-2
                                           });
                                       });
                               } else {
                                   self.$base.addClass('transitioner');
                                   w = self.$base.css('width');
                                   h = self.$base.css('height');
                                   l = self.$base.css('left');
                                   t = self.$base.css('top');
                                   self.$base.animate({'width':(desktop.width()-10),'height':(desktop.height()-10),'left':0,'top':0},0,function()
                                       {
                                           self.$base.removeClass('transitioner').children('.contentarea').css({
                                               'height':self.$base.height()-self.$titlebar.height()-2
                                           });
                                       });
                               }

                           });

                       /* maximize/restore on title bar doubleclick */
                       this.$titlebar.dblclick(function(){
                           self.$maximizeBtn.trigger("click");
                       });

               /*close button - always visible*/
               this.$closeBtn = $("<a />");
               this.$titleButtons.append(this.$closeBtn);
               $(".win-active").removeClass("win-active");
               self.$base.addClass("win-active");
               this.unnotify();
               self.$closeBtn.attr('href','#')
                   .html('')
                   .addClass('closebtn')
                   .click(function(){
                       /*this line with tinymce should be removed, if you aren't using tinyMCE, as it will cause an error*/
                       self.$base.fadeOut('fast', function () {
                           self.$base.remove();
                           var top = nJDSK.WindowList.get_top();
                           if (top) {
                               top.$taskbarBtn.addClass("activetsk");
                               top.$base.addClass("win-active");
                               top.unnotify();
                           }

                       });
                       self.$taskbarBtn.hide('fast',function(){
                           $(this).remove();
                       });

                       /*unregister this window instance*/
                       nJDSK.WindowList.delete_item(id);
                   });



               /*make the window resizable, and draggable and add resize handle+drag behaviors*/
               $(wnd).resize(function(){
                   self.$base.draggable({handle:self.$titlebar}).resizable();
               });


               /*make the window draggable all around the screen*/
               this.$base.draggable({handle:self.$titlebar});
               this.$base.resizable({ containment: "parent" });

               /*show the base div*/
               this.$base.fadeIn();

               /*add close function - for the window be removable from outside*/
               this.close=function(){
                   self.$base.fadeOut('fast',function(){
                       self.$base.remove();
                       var top = nJDSK.WindowList.get_top();
                       if (top) {
                           top.$base.addClass("win-active");
                           top.unnotify();
                           top.$taskbarBtn.addClass("activetsk");
                       }
                   });
                   self.$taskbarBtn.hide('fast',function(){
                       self.$taskbarBtn.remove();
                   });
                   /*unregister this window instance*/
                   nJDSK.WindowList.delete_item(id);
               }

               // create the taskbar button
               this.$taskbarBtn = $("<div />");
               this.$taskbarBtn.attr('id','tskbrbtn_'+id)
                   .html(title)
                   .addClass('taskbarbutton')
                   .addClass('activetsk');
               $('#taskbarbuttons').append(this.$taskbarBtn);
               $('.taskbarbutton').removeClass('activetsk');
               this.$taskbarBtn.addClass('activetsk');
               $('#taskbarbuttons').scrollTo(this.$taskbarBtn,'fast');

               // add taskbar button behavior
               this.$taskbarBtn.click(function(){
                   if (self.$taskbarBtn.hasClass('activetsk') && self.$base.is(':visible'))
               {
                   self.$base.hide().removeClass("win-active");
                   var top = nJDSK.WindowList.get_top();
                   $(".activetsk").removeClass("activetsk");
                   if (top) {
                       top.$base.addClass("win-active");
                       top.unnotify();
                       top.$taskbarBtn.addClass("activetsk");
                   }
                   return;
               } else {
                   $(".win-active").removeClass("win-active");
                   self.$base.show().addClass("win-active");
                   nJDSK.WindowList.get_window(id).unnotify();

               }
               $('.taskbarbutton').removeClass('activetsk');
               self.$taskbarBtn.addClass('activetsk');
               self.$base.css({'z-index':nJDSK.WindowList.lastZIndex});
               nJDSK.WindowList.lastZIndex+=1;
               });

               // add window behavior on activation
               self.$base.mousedown(function(){
                   $('.taskbarbutton').removeClass('activetsk');
                   self.$taskbarBtn.addClass('activetsk');

                   // reveal taskbar button if it's outside the visible taskbar area
                   $('#taskbarbuttons').scrollTo($('#tskbrbtn_'+id),'fast');

                       $(".win-active").removeClass("win-active");
                       self.$base.css({ 'z-index': nJDSK.WindowList.lastZIndex }).addClass("win-active");
                       nJDSK.WindowList.get_window(id).unnotify();
                       nJDSK.WindowList.lastZIndex+=1;
               });

               // add content area this will hold all the stuff
               this.contentArea = document.createElement('div');
               this.$content = $(this.contentArea);
               this.$base.append(this.$content);
               // set up contentarea look and feel
               this.$content.addClass('contentarea');

               this.$content.css({
                   'height':self.$base.height()-self.$titlebar.height()-2
               });

               if (fullGlass === true) {
                   this.setFullGlass();
               }

               // insert the content
               this.$content.html(content);

               /*
                * window behavior on resize
                * */
               this.$base.resize(function(){
                   self.$content.css({
                       'height':self.$base.height()-self.$titlebar.height()-2
                   });

               });

               // arbitrary resize through program
               this.setDimensions = function(left,top,width,height)
               {
                   self.$base.css({"left" : left + 'px',"top" : top + 'px', 'width' : (width - 10) + 'px', 'height' : (height - 10) + 'px'}).resize();
               }



               /*facility to change title from outside*/
               this.setTitle = function(ititle)
               {
                   this.$taskbarBtn.html(ititle);
                   this.$titleText.html(ititle);
               }

               // facility to make a window unclosable
               this.noClose = function(){
                   self.$base.find('a.closebtn').remove();  
               }

               //register the window object and store array index
               this.index = nJDSK.WindowList.add_item(id, this);	

               // run callback upon window creation
               if (typeof createCallback == 'function')
               {
                   createCallback('win_'+id);
               }

           },

    frameDialog: function (title, id, src, args) {
                     var html = '<iframe src="' + src + '" class="win-frame"></iframe>';
                     var win = new nJDSK.Window(600, 480, title, '', html, id);
                     return win;
                 },

    /**
     * Generate a unique id for windows
     */
    uniqid: function()
    {
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
                    addIcon: function(iconId,iconTitle,iconImage,callback){

                                 $('#desktop #desktop_iconarea').append('<a class="icon" id="'+iconId+'" style="display:none"><img src="'+iconImage+'" /><span>'+iconTitle+'</span></a>');
                                 if (nJDSK.nextIconPos.top+nJDSK.iconMaxHeight+(nJDSK.iconMargin*2)+(nJDSK.iconBorderWeight*2) < nJDSK.desktopHeight)
                                 {
                                     $('#'+iconId).css({'left':nJDSK.nextIconPos.left+'px','top':nJDSK.nextIconPos.top+'px'});
                                 }
                                 else
                                 {
                                     nJDSK.nextIconPos.top = 0;
                                     nJDSK.nextIconPos.left = nJDSK.nextIconPos.left+nJDSK.iconWidth+(nJDSK.iconMargin*2)+(nJDSK.iconBorderWeight*2);
                                     $('#'+iconId).css({'left':nJDSK.nextIconPos.left+'px','top':nJDSK.nextIconPos.top+'px'});
                                 }

                                 if (typeof(callback) == 'function')
                                 {
                                     $('#' + iconId).click(function (e) { return callback(e) });
                                 }

                                 nJDSK.nextIconPos.top=nJDSK.nextIconPos.top+nJDSK.iconMaxHeight+nJDSK.iconMargin*2+nJDSK.iconBorderWeight*2;

                                 var icn = $('#'+iconId);
                                 icn.show();
                                 icn.mousedown(function(e){
                                     nJDSK.clearActive();
                                     icn.addClass('activeIcon');
                                 });

                                 icn.click(function(e){
                                     e.stopPropagation();
                                 });
                                 icn.draggable({containment: "parent"});
                             },

                    /**
                     * Deletes selected icon
                     * @param string iconId	The icon ID
                     */
                    removeIcon: function(iconId)
                    {
                        $('#'+iconId).remove();
                    },

                    /**
                     * Rearranges icons - currently used by the resize function
                     */
                    reArrangeIcons: function(){
                                        nJDSK.nextIconPos.left = 0;
                                        nJDSK.nextIconPos.top = 0;
                                        $('#desktop_iconarea .icon').each(function(){

                                            if (nJDSK.nextIconPos.top+nJDSK.iconMaxHeight+(nJDSK.iconMargin*2)+(nJDSK.iconBorderWeight*2) < nJDSK.desktopHeight)
                                        {
                                            $(this).css({'left':nJDSK.nextIconPos.left+'px','top':nJDSK.nextIconPos.top+'px'});
                                        }
                                            else
                                        {
                                            nJDSK.nextIconPos.top = 0;
                                            nJDSK.nextIconPos.left = nJDSK.nextIconPos.left+nJDSK.iconWidth+(nJDSK.iconMargin*2)+(nJDSK.iconBorderWeight*2);
                                            $(this).css({'left':nJDSK.nextIconPos.left+'px','top':nJDSK.nextIconPos.top+'px'});
                                        }

                                        nJDSK.nextIconPos.top=nJDSK.nextIconPos.top+nJDSK.iconMaxHeight+nJDSK.iconMargin*2+nJDSK.iconBorderWeight*2;

                                        });
                                    }
                },

    /**
     * idea borrowed From JQuery Desktop http://desktop.sonspring.com/
     * Sets background image for the Desktop environment - can be called at any time
     * @param string bgimage //the background image we wish to use
     */
    setBackground: function(bgimage)
    {
        $('#nJDSKBG').remove();
        $('body').prepend('<img id="nJDSKBG" src="'+bgimage+'" />');

    },

    /**
     * idea borrowed From JQuery Desktop http://desktop.sonspring.com/
     * Clears selection
     */
    clearActive: function(){
                     $('.activeIcon').removeClass('activeIcon');
                 },

    /**
     * Put desktop system together
     */
    init:function(){
             $(wnd).resize(function()
                 {
                     nJDSK.desktopWidth = $(wnd).width();
                     nJDSK.desktopHeight = $(wnd).height()-nJDSK.taskbarHeight;
                     $('#desktop').css({"height":(nJDSK.desktopHeight)+'px',"width":nJDSK.desktopWidth+'px', "top":'0'});
                     $('#widgets').css({"height":$('#desktop').height()+'px','top':'0'});
                     nJDSK.iconHelper.reArrangeIcons();
                 });	

             $('#taskbar').css({"height":nJDSK.taskbarHeight+'px'});
             $('#widgets').css({"width":nJDSK.widgetWidth+'px'});
             $('#desktop').click(function(e){
                 nJDSK.clearActive(e);
             });
             $(wnd).resize();

             // taken from JQuery Desktop http://desktop.sonspring.com/
             $(d).on('click','a',function(e){
                 var url = $(this).attr('href');
                 if (url.match(/^#/)){
                     e.preventDefault();
                     e.stopPropagation();
                 }
                 else
             {
                 $(this).attr('target','_blank');
             }

             });

             // Show/hide windows on desktop
             $('a#showdesktop').click(function(e){
                 nJDSK.clearActive();
                 if ($('.window').is(':visible'))
             {
                 $('.window').hide();
             }
                 else
             {
                 $('.window').show();
             }
             });

         }
    }

})(window, document, jQuery);
