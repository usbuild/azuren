/* Virtual Desktop system*/
var nJDSK = (function(wnd,d,$){
	return{
		/*These settings can be changed*/
		taskbarHeight: 30,
	  	topMenuHeight: 0,
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
	  		items:[],
	  		lastZIndex : 1000,
	  		left : 10,
	  		top: 10,
	  		
	  		get_top: function () {


	  		    var b = null;
	  		    var win = null;
	  		    for (var i = 0; i < this.items.length; i++) {
	  		        var obj = $("#win_" + this.items[i].window_id);
                    if (obj.is(":visible") && ( b == null ||obj.css("z-index") > b.css("z-index") )) {
                        b = obj;
                        win = this.items[i].window_object;
                    }
	  		    }
	  		    return win;
	  		},
	  		
	  		/**
	  		 * Adds a new window instance to the list
	  		 * @param string id //window id
	  		 * @param object win_object //window instance
	  		 */
	  		add_item:function(id,win_object)
	  		{
	  			this.items.push({window_id:id,window_object:win_object});
	  		},
	  		
	  		/**
	  		 * Removes a window instance
	  		 * @param string id //window id
	  		 */
	  		delete_item:function(id) {
	  		    this.get_window(id).onClose();
	  			this.items.splice(this.index_of(id),1);
	  		},
	  		
	  		/**
	  		 * Returns window object index in the list
	  		 * @param string id // window id 
	  		 */
	  		index_of:function(id)
	  		{
	  			for (var i=0;i<this.items.length;i++)
	  			{
	  				if (id==this.items[i].window_id)
	  				{
	  					return i;
	  				}
	  			}
	  		},
	  		
	  		/**
	  		 * Returns window instance by given id
	  		 * @param string id
	  		 */
	  		get_window:function(id)
	  		{
	  			for (var i=0;i<this.items.length;i++)
	  			{
	  				if (id==this.items[i].window_id)
	  				{
	  					return this.items[i].window_object;
	  				}
	  			}
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
	  		
		  	  /**
		  	   * Restore standard content area
		  	   */
		  	  this.removeFullGlass = function()
		  	  {
		  		$(this.contentArea).removeClass('fullGlass');
		  	  }

		  	  /**
		  	   * Turn content area backgrounds and borders transparent
		  	   */
	  	    
		  	  this.setFullGlass = function()
		  	  {
		  	      $(this.contentArea).addClass('fullGlass');
		  	  }
	  		
	  		
		/*
		 * Provide basic cascading on window creation
		 */
			
		  	  this.modal = modal;
	  	    this.id = id;
		
		if ((dialog === false) || typeof(dialog) == 'undefined')
		{
		    if ((nJDSK.WindowList.left + 25 + parseInt(width)) > $(wnd).width()/*-nJDSK.widgetWidth*/) {
				nJDSK.WindowList.left = 10;
			} else {
				nJDSK.WindowList.left+=25;
			}
			
			if (nJDSK.WindowList.top+25+parseInt(height) > ($(wnd).height()-nJDSK.taskbarHeight-nJDSK.topMenuHeight)){
				nJDSK.WindowList.top = 10;
			} else {
				nJDSK.WindowList.top+=25;
			}
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
		if ($('#win_'+id).length == 1){
			$('.taskbarbutton').removeClass('activetsk');
			$('#tskbrbtn_' + id).addClass('activetsk');
			$('#win_' + id).css({ 'z-index': nJDSK.WindowList.lastZIndex }).show();
			nJDSK.WindowList.lastZIndex+=1;
			var obj = nJDSK.WindowList.items[nJDSK.WindowList.index_of(id)].window_object;
			obj['isNew'] = false;
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
		
	  	  this.base = document.createElement('div');
          this.$base = $(this.base);
	  	  if (this.modal !==true)
	  	  {
	  		  $('#desktop').append(this.base);
	  	  }
	  	  else
	  	  {
	  		  $('body').append('<div id="Winbg_'+id+'" class="modalbg"></div>').append(this.base);
	  	  }
	  	  
	  	  if (this.modal!=true)
	  	  {
	  		  /*
	  		   * Cascade the window if it's not modal (new windows will be shown with a small offset, 
	  		   * obeying desktop size)
	  		   * */
		  	  this.$base.css({
		  	    'position':'absolute',
		  	    'top':nJDSK.WindowList.top+'px',
		  	    'left':nJDSK.WindowList.left+'px',
		  	    'width':width+'px',
		  	    'height':height+'px',
		  	    'z-index':nJDSK.WindowList.lastZIndex
		  	  });
	  	  } else
	  	  {
	  		  /*
	  		   * if modal, place window on the screen center
	  		   * */
	  		  this.$base.css({
	  			    'position':'absolute',
	  			    'top':'50%',
	  			    'left':'50%',
	  			    'width':width+'px',
	  			    'height':height+'px',
	  			    'margin-left':'-'+(width/2)+'px',
	  			    'margin-top':'-'+(height/2)+'px',
	  			    'z-index':99999999
	  			  });
	  		  
	  	  }

	  	    this.onClose = function() {

	  	    };

	  	    this.isActive = function () {
	  	        return $("#win_" + id).hasClass("win-active");
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
	  	  this.titlebar = document.createElement('div');
          this.$titlebar = $(this.titlebar);
	  	  this.base.appendChild(this.titlebar);
	  	  this.$titlebar.addClass('titlebar').css({'cursor':'default'});
	  	  
	  	  /*title bar text area*/
	  	  this.titleText = document.createElement('span');
          this.$titleText = $(this.titleText);
	  	  this.titlebar.appendChild(this.titleText);
	  	  this.$titleText.html(title);
	  	  
	  	  /*title buttons container*/
	  	  this.titleButtons = document.createElement('div');
	  	  this.titlebar.appendChild(this.titleButtons);
          this.$titleButtons = $(this.titleButtons);
	  	  this.$titleButtons.addClass('titlebuttons')
	  	//  this.sysIcon = document.createElement('a'); // not implemented yet
	  	  
	  	  /*create title buttons depending on window type (dialog or not)*/
	  	  if (dialog!=true)
	  	  {
	  		  this.minMax = function(){
	  			  
	  		  };
	  		  /*minimize button*/
	  		  this.minimizeBtn = document.createElement('a');
              this.$minimizeBtn = $(this.minimizeBtn);
	  		  this.titleButtons.appendChild(this.minimizeBtn);
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
	  		  this.maximizeBtn = document.createElement('a');
              this.$maximizeBtn = $(this.maximizeBtn);
	  		  this.titleButtons.appendChild(this.maximizeBtn);
	  		  this.$maximizeBtn.attr('href','#').html('').addClass('maximizebtn')
	  		  .click(function(){
	  			self.$base.addClass('transitioner');  
	  		    if ((self.$base.outerWidth()==$('#desktop').width()-10)&&(self.$base.outerHeight()==$('#desktop').height()-10)){
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
	  		       self.$base.animate({'width':($('#desktop').width()-10),'height':($('#desktop').height()-10),'left':0,'top':0},0,function()
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
	  	  }
	  	  
	  	  /*close button - always visible*/
	  	  this.closeBtn = document.createElement('a');
          this.$closeBtn = $(this.closeBtn);
	  	  this.titleButtons.appendChild(this.closeBtn);
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
	  		  $('#Winbg_'+id).remove();
	  		  self.$taskbarBtn.hide('fast',function(){
	  			  $(this).remove();
	  		  });
	  		  
	  		  /*unregister this window instance*/
	  		  nJDSK.WindowList.delete_item(id);
	  	  });
	  	  
	  	  
	  	  
	  	  /*make the window resizable, and draggable and add resize handle+drag behaviors*/
	  	  var titlebar = this.titlebar;
	  	  
	  	  $(wnd).resize(function(){
	  	          self.$base.draggable({handle:titlebar}).resizable();
	  	  });

	  	  
	  	  /*make the window draggable all around the screen*/
	  	  this.$base.draggable({handle:this.titlebar});
	  	  if (dialog != true)
	  	  {
	  		  this.$base.resizable({ containment: "parent" });
	  	  }
	  	  
	  	  /*show the base div*/
	  	  this.$base.fadeIn();

	  	  /*add close function - for the window be removable from outside*/
	  	  this.close=function(){
	  		  /*this line with tinymce should be removed, if you aren't using tinyMCE, as it will cause an error*/
	  		//$('#win_'+id+' textarea.tinymce').tinymce().remove();
	  		  self.$base.fadeOut('fast',function(){
	  		      self.$base.remove();
	  		      var top = nJDSK.WindowList.get_top();
	  		      if (top) {
	  		          top.$base.addClass("win-active");
	  		          top.unnotify();
	  		          top.$taskbarBtn.addClass("activetsk");
	  		      }
	  		  });
	  		  if (this.modal==true)
	  		  {
	  			  $('#Winbg_'+id).remove();
	  		  }
	  		  self.$taskbarBtn.hide('fast',function(){
	  			  self.$taskbarBtn.remove();
	  		  });
	  		  
	  		  /*unregister this window instance*/
	  		  nJDSK.WindowList.delete_item(id);
	  		  
	  	  }
	  	  
	  	  // create the taskbar button
	  	  this.taskbarBtn=document.createElement('div');
          this.$taskbarBtn = $(this.taskbarBtn);
	  	  this.$taskbarBtn.attr('id','tskbrbtn_'+id)
	  	  .html(title)
	  	  .addClass('taskbarbutton')
	  	  .addClass('activetsk');
	  	  document.getElementById('taskbarbuttons').appendChild(this.taskbarBtn);
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
	  		  
	  		  if (!modal) {
	  		      $(".win-active").removeClass("win-active");
	  		      self.$base.css({ 'z-index': nJDSK.WindowList.lastZIndex }).addClass("win-active");
	  		      nJDSK.WindowList.get_window(id).unnotify();
	  			  nJDSK.WindowList.lastZIndex+=1;
	  		  }
	  	  });
	  	  
	  	  // add content area this will hold all the stuff
	  	  this.contentArea = document.createElement('div');
          this.$content = $(this.contentArea);
	  	  this.base.appendChild(this.contentArea);
	  	  // set up contentarea look and feel
	  	  this.$content.addClass('contentarea');
	  	  if (dialog) {
	  	    this.$content.addClass('dialog');
	  	  }
	  	  
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
	  	   * handles embedded tinyMCE editor if available
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
	  	  
	  		

	  	  this.lastSelected=null;
	  	  this.sortColumn=null;

	  	  /*facility to change title from outside*/
	  	  this.setTitle = function(ititle)
	  	  {
	  			this.$taskbarBtn.html(ititle);
	  			this.$titleText.html(ititle);
	  	  }
	  	  
	  	  // facility to make a window unclosable
	  	  this.noClose = function(){
	  		$(this.base).find('a.closebtn').remove();  
	  	  }
	  		
	  	  this.editor = null;
	  	  this.data = null;
	  	  
	  	  var windowBase = this.base;
	  	  
	  	  
	  	  //register the window object and store array index
	  	  this.index = nJDSK.WindowList.add_item(id, this);	
	  	  
	  	  // run callback upon window creation
	  	  if (typeof createCallback == 'function')
	  	  {
	  		  createCallback('win_'+id);
	  	  }
	  		
	  	},
	  	
	  	/**
	  	 * connect callback function
	  	 */
	  	return_confirm_callback_func: function(buttons,index,win)
	  	{
	  		return function()
	  		{
	  			if (buttons[index].callback)
	  			{
	  				buttons[index].callback(win);
	  			}
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
	  	
	  	/**
	  	 * Tile windows
	  	 */
	  	
	  	tile: function(){
	  		var windowCount = this.WindowList.items.length;
	  		
	  		if (windowCount > 20)
	  			windowCount = 20;
	  		
	  		var rowCount = 1;
	  		var row1count = 1;
	  		var row2count = 1;
	  		var row3count = 1;
	  		var row4count = 1;
	  		
	  		switch(windowCount)
	  		{
	  			case 2: 
	  				rowCount = 1;
	  				row1count = 2;
	  			break;
	  			case 3:
	  				rowCount = 1;
	  				colCount = 3;
	  				row1count = 3;
	  			break;
	  			case 4:
	  				rowCount = 2;
	  				row1count = 2;
	  				row2count = 2;
	  			break;
	  			case 5:
	  				rowCount = 2;
	  				row1count = 2;
	  				row2count = 3;
	  			break;
	  			case 6:
	  				rowCount = 2;
	  				row1count = 3;
	  				row2count = 3;
	  			break;
	  			case 7:
	  				rowCount = 3;
	  				row1count = 2;
	  				row2count = 3;
	  				row3count = 2;
	  			break;
	  			case 8:
	  				rowCount = 3;
	  				row1count = 2;
	  				row2count = 3;
	  				row3count = 3;
	  			break;
	  			case 9:
	  				rowCount = 3;
	  				row1count = 3;
	  				row2count = 3;
	  				row3count = 3;
	  			break;
	  			case 10:
	  				rowCount = 3;
	  				row1count = 3;
	  				row2count = 4;
	  				row3count = 3;
	  			break;
	  			case 11:
	  				rowCount = 3;
	  				row1count = 3;
	  				row2count = 4;
	  				row3count = 4;
	  			break;
	  			case 12:
	  				rowCount = 3;
	  				row1count = 4;
	  				row2count = 4;
	  				row3count = 4;
	  			break;
	  			case 13:
	  				rowCount = 4;
	  				row1count = 3;
	  				row2count = 3;
	  				row3count = 4;
	  				row4count = 3;
	  			break;
	  			case 14:
	  				rowCount = 4;
	  				row1count = 3;
	  				row2count = 4;
	  				row3count = 4;
	  				row4count = 3;
	  			break;
	  			case 15:
	  				rowCount = 4;
	  				row1count = 3;
	  				row2count = 4;
	  				row3count = 4;
	  				row4count = 4;
	  			break;
	  			case 16:
	  				rowCount = 4;
	  				row1count = 4;
	  				row2count = 4;
	  				row3count = 4;
	  				row4count = 4;
	  			break;
	  			case 17:
	  				rowCount = 4;
	  				row1count = 4;
	  				row2count = 4;
	  				row3count = 5;
	  				row4count = 4;
	  			break;
	  			case 18:
	  				rowCount = 4;
	  				row1count = 4;
	  				row2count = 5;
	  				row3count = 5;
	  				row4count = 4;
	  			break;
	  			case 19:
	  				rowCount = 4;
	  				row1count = 4;
	  				row2count = 5;
	  				row3count = 5;
	  				row4count = 5;
	  			break;
	  			case 20:
	  				rowCount = 4;
	  				row1count = 5;
	  				row2count = 5;
	  				row3count = 5;
	  				row4count = 5;
	  			break;
	  		}
	  		
	  		var rc = 0;
	  		var cc = 0;
	  		
	  		for (var i = 0; i < windowCount; i++)
	  		{
	  			var row = 1;
	  			var tw = 0;
	  			var th = 0;
	  			var tt = 0;
	  			var tl = 0;
	  			
	  			if ((windowCount < 4) && (rowCount == 1))
	  			{
	  				th = $('#desktop_iconarea').height();
	  				tw = $('#desktop_iconarea').width() / row1count;
	  				tl = ($('#desktop_iconarea').width() / row1count) * i;
	  				tt = 0;
	  				this.WindowList.items[i].window_object.setDimensions(tl,tt,tw,th);
	  			}
	  			
	  			if (windowCount > 3) 
	  			{
	  				th = $('#desktop_iconarea').height() / rowCount;
	  				if (rc == 0)
	  					tw = $('#desktop_iconarea').width() / row1count;
	  				if (rc == 1)
	  					tw = $('#desktop_iconarea').width() / row2count;
	  				if (rc == 2)
	  					tw = $('#desktop_iconarea').width() / row3count;
	  				if (rc == 3)
	  					tw = $('#desktop_iconarea').width() / row4count;
	  				
	  				if (rc == 0)
	  					tl = ($('#desktop_iconarea').width() / row1count) * cc;
	  				if (rc == 1)
	  					tl = ($('#desktop_iconarea').width() / row2count) * cc;
	  				if (rc == 2)
	  					tl = ($('#desktop_iconarea').width() / row3count) * cc;
	  				if (rc == 3)
	  					tl = ($('#desktop_iconarea').width() / row4count) * cc;
	  				
	  				tt = ($('#desktop_iconarea').height() / rowCount) * rc;
	  				
	  				this.WindowList.items[i].window_object.setDimensions(tl,tt,tw,th);
	  				cc += 1;
	  				if (((rc == 0) && (cc >= row1count)) || 
	  					((rc == 1) && (cc >= row2count)) ||
	  					((rc == 2) && (cc >= row3count)))
	  				{
	  					rc += 1;
	  					cc = 0;
	  				}
	  			}
	  			
	  			
	  		}
	  	},
	  	
	  	cascade: function(){
	  		var wt = 0;
	  		var wl = 0;
	  		
	  		var windowCount = this.WindowList.items.length;
	  		
	  		for (var i = 0; i < windowCount; i++)
	  		{
	  		    if ((wl + 25 + 640) > $(wnd).width()/* - nJDSK.widgetWidth*/) {
					wl = 10;
				} else {
					wl+=25;
				}
				
				if ((wt+25+480) > ($(wnd).height()-nJDSK.taskbarHeight-nJDSK.topMenuHeight)){
					wt = 10;
				} else {
					wt+=25;
				}
				
				this.WindowList.items[i].window_object.setDimensions(wl,wt,640,480);
	  		}
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
	  		    nJDSK.desktopWidth = $(wnd).width()/*-nJDSK.widgetWidth*/;
	  			nJDSK.desktopHeight = $(wnd).height()-nJDSK.taskbarHeight-nJDSK.topMenuHeight;
	  			$('#desktop').css({"height":(nJDSK.desktopHeight)+'px',"width":nJDSK.desktopWidth+'px', "top":nJDSK.topMenuHeight+'px'});
	  			$('#widgets').css({"height":$('#desktop').height()+'px','top':nJDSK.topMenuHeight+'px'});
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
