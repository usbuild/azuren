﻿


$(document).ready(function () {
	Azuren.init();
	Azuren.setBackground('/Images/bg_main.jpg');
    Azuren.terminal("#terminal", "/Console");
    Azuren.widget.install('wdgClock', '/Widget/Clock', 200, 160);
    Azuren.widget.install('wdgWeather', '/Widget/Weather', 250, 150);
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
