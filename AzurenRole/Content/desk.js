


$(document).ready(function () {
    Azuren.init();


    var backgrounds = $.map(new Array(24), function(a, i) {
        return "http://1.su.bdimg.com/all_skin/" + (i + 1) + ".jpg";
    });

    var setBack = function () {
        Azuren.setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
        setTimeout(setBack, 60000);
    };
    setBack();
    
    Azuren.terminal("#terminal", "/Console");
    Azuren.widget.install('wdgClock', '/Widget/Clock', 180, 180);
    Azuren.widget.install('wdgWeather', '/Widget/Weather', 250, 150);
    $.getScript("/Content/app/store.js", function() {
    });
    $.getScript("/Content/app/file.js", function() {
        
    });
    $.getScript("/Content/app/chat.js", function () {
        $.getJSON("/Home/App", {}, function (e) {
            for (x in e.data) {
                Azuren.app.installEx(e.data[x].id, e.data[x].name, e.data[x].icon, e.data[x].url, e.data[x].width, e.data[x].height);
            }
        });
    });

});
