


$(document).ready(function () {
    Azuren.init();


    var backgrounds = ['http://s.cn.bing.net/az/hprichbg/rb/ZabriskiePoint_ZH-CN8612415719_1366x768.jpg',
        'http://www.bing.com/az/hprichbg/rb/DenaliSquirrel_ROW8950751143_1366x768.jpg',
        'http://www.bing.com/az/hprichbg/rb/HawaiiPineapple_ROW12962179372_1366x768.jpg',
        'http://www.bing.com/az/hprichbg/rb/AustRifleBird_ROW12055241844_1366x768.jpg'
    ];

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
    $.getScript("/Content/app/chat.js", function () {
        $.getJSON("/Home/App", {}, function (e) {
            for (x in e.data) {
                Azuren.app.installEx(e.data[x].id, e.data[x].name, e.data[x].icon, e.data[x].url, e.data[x].width, e.data[x].height);
            }
        });
    });

});
