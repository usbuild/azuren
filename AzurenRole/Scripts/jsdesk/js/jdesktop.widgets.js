/**
 * nJDesktop Virtual Desktop widget helper plugin
 * Copyright (C) 2012 Nagy Ervin
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by    
 * the Free Software Foundation, either version 3 of the License, or    
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * -----------------------------------------------------------------------
 * Nagy Ervin
 * nagyervin.bws@gmail.com
 * 
 * License: GPL v.3, see COPYING
 * 
 * If you wish to fork this, please let me know: nagyervin.bws@gmail.com.
 * 
 * Please leave this header intact
 * 
 * -----------------------------------------------------------------------
 * Insert your name below, if you have modified this project. If you wish 
 * that change become part of this project (aka i will endorse it), please 
 * send it to me.
 * 
 * I must remind you, that your changes will be subject to the GPL v.3.
 * 
 */

(function(wnd,d,$){
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
	        item.draggable({ handle: ".widget-title .wdg-move" });
	        item.find(".wdg-close").click(function (e) {
	            item.remove();
	        });
	        item.hover(function(parameters) {
	            item.find(".widget-title").css("visibility", "visible");
	        }, function () {
	            item.find(".widget-title").css("visibility", "hidden");
	        });
            
	    }
	} );
})(window,document,jQuery);
