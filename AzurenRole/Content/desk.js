


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

    $.ajaxSetup({ cache: false });

    Azuren.widget.install('wdgClock', '/Widget/Clock', 180, 180);
    Azuren.widget.install('wdgWeather', '/Widget/Weather', 250, 150);
    var opt = {
        origin: true,
        callback: function(key, options) {
            switch (key) {
            case "refresh":
                {
                    Azuren.desktop.refresh();
                }
                break;
            case "lock":
                {
                    Azuren.desktop.lock();
                }
                break;
            case "customize":
                {
                    Azuren.desktop.customizeDialog();
                }
                break;
            case "logout":
                {
                    Azuren.system.logout();
                }
                break;
            }
        },
        items: {
            "refresh": { name: "Refresh" },
            "lock": { name: "Lock Screen" },
            "customize": { name: "Customize" },
            "logout": { name: "Log out" }
        }
    };
    var opt1 = $.extend({ selector: "#desktop" }, opt);
    var opt2 = $.extend({ selector: "#desktop_iconarea" }, opt);
    $.contextMenu(opt1);
    $.contextMenu(opt2);

    $.contextMenu({
        selector: "li.widget:not(.nocontextmenu)",
        origin: false,
        callback: function (key, options) {
            switch (key) {
                case "sendDesktop":
                    {
                        Azuren.desktop.addIcon($(this).data("id"));
                    } break;
            }
        },
        items: {
            "sendDesktop": { name: "Send To Desktop" },
        }
    });

    $.contextMenu({
        selector: ".desktop-icon",
        callback: function (key, options) {
            var appId = $(this).data("id");
            switch (key) {
                case "open":
                    {
                        Azuren.app.start(appId);
                    }
                    break;
                case "delete":
                    {
                        Azuren.desktop.removeIcon(appId);
                    }
                    break;
            }
        },
        items: {
            "open": { name: "Open" },
            "delete": { name: "Delete" },
        }
    });

    $.getScript("/bundles/initialize", function () {
    });


    $.getJSON("/Home/App", {}, function (e) {
        for (x in e.data) {
            Azuren.app.installEx(e.data[x].id, e.data[x].name, e.data[x].icon, e.data[x].url, e.data[x].width, e.data[x].height, e.data[x].iwidth, e.data[x].iheight, e.data[x].type, e.data[x].tile);
        }
        $.get("/Customize", {}, function (e) {
            if (e.code == 0) {
                for (x in e.data.Apps) {
                    var id = e.data.Apps[x];
                    if(id.length > 0)Azuren.desktop.pin(id);
                }
            }
        });
    });

    Azuren.desktop.setlock("/Images/Lock-Screen.png");
});
