


$(document).ready(function () {
    Azuren.init();

    /*
    var backgrounds = $.map(new Array(24), function (a, i) {
        return "http://1.su.bdimg.com/all_skin/" + (i + 1) + ".jpg";
    });

    var setBack = function () {
        Azuren.desktop.setBackground(backgrounds[Math.floor(Math.random() * backgrounds.length)]);
        setTimeout(setBack, 60000);
    };

    setBack();
    */
    Azuren.desktop.setBackground("/Images/background.jpg");

    Azuren.terminal("#terminal", "/Console");
    Azuren.widget.install('wdgClock', '/Widget/Clock', 180, 180);
    Azuren.widget.install('wdgWeather', '/Widget/Weather', 250, 150);
    $.contextMenu({
        selector: "#desktop",
        origin: true,
        callback: function (key, options) {
            switch (key) {
                case "refresh":
                    {
                        Azuren.desktop.refresh();
                    } break;
                case "lock":
                    {
                        Azuren.desktop.lock();
                    } break;
                case "logout":
                    {
                        Azuren.system.logout();
                    }
                    break;
                case "theme":
                    {
                        Azuren.desktop.setTheme("pink");
                    } break;
            }
        },
        items: {
            "refresh": { name: "Refresh" },
            "background": { name: "Change Background" },
            "theme": { name: "Change Theme" },
            "lock": { name: "Lock Screen" },
            "settings": { name: "Settings" },
            "logout": { name: "Log out" }
        }
    });
    $.getScript("/Content/app/store.js", function () {
    });
    $.getScript("/Content/app/file.js", function () {

    });
    $.getScript("/Content/app/browser.js", function () {

    });
    $.getScript("/Content/app/chat.js", function () {
        $.getJSON("/Home/App", {}, function (e) {
            for (x in e.data) {
                Azuren.app.installEx(e.data[x].id, e.data[x].name, e.data[x].icon, e.data[x].url, e.data[x].width, e.data[x].height);
            }
        });
    });
    Azuren.desktop.setlock("/Images/Lock-Screen.png");
});
