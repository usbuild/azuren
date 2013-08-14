(function ($) {
    $.fn.Azuren = function (url, options) {
        if ($('body').data('azuren-term')) {
            return $('body').data('azuren-term').terminal;
        }
        this.addClass('azuren-term');
        options = options || {};
        var settings = {
            prompt: 'Azuren> ',
            name: 'azuren',
            enabled: false,
            greetings: "Welcome to use azuren console",
            keypress: function (e) {
                if (e.which == 96) {
                    return false;
                }
            }
        };
        if (options) {
            $.extend(settings, options);
        }
        this.append('<div class="azuren-td"></div>');
        var self = this;
        self.terminal = this.find('.azuren-td').terminal(url, settings);
        var focus = false;
        $(document.documentElement).keypress(function (e) {
            if (e.which == 96) {
                self.slideToggle('fast');
                self.terminal.focus(focus = !focus);
                self.terminal.attr({
                    scrollTop: self.terminal.attr("scrollHeight")
                });
            }
        });
        $('body').data('azuren-term', this);
        this.hide();
        return self;
    };
})(jQuery);

$(document).ready(function () {
	nJDSK.init();
	nJDSK.setBackground('/Images/bg_main.jpg');
	window.Azuren = window.Azuren || { app: {}, widget: {} };
    Azuren.WindowList = nJDSK.WindowList;
	Azuren.app.install = function (id, name, icon, callback) {
	    nJDSK.iconHelper.addIcon(id, name, icon, callback);
	};
    Azuren.app.installEx = function(id, name, icon, url, width, height) {
        nJDSK.iconHelper.addIcon(id, name, icon, function () {
            nJDSK.frameWindow(id, name, url, width, height);
        });
    };

	Azuren.showWindow = function (height, width, id, title, content, callback) {
	    return new nJDSK.Window(height, width, title, content, id, callback);
	};
    Azuren.widget.install = function (id, url, width, height) {
	    nJDSK.widgets.addItem(id, url, width, height);
    };
 

    Azuren.widget.install('wdgClock', '/Widget/Clock', 200, 160);
    Azuren.widget.install('wdgWeather', '/Widget/Weather', 250, 150);
    /*
    Set Terminal
    */
    $('#terminal').Azuren("/Console");
    
    $.getScript("/Content/app/store.js", function() {
    });
    $.getScript("/Content/app/chat.js", function () {
        $.getJSON("/Home/App", {}, function (e) {
            for (x in e.data) {
                Azuren.app.installEx(e.data[x].id, e.data[x].name, e.data[x].icon, e.data[x].url, e.data[x].width, e.data[x].height);
            }
        });
    });

});
