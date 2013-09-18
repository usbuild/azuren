
///
(function ($, desk) {
    window.Azuren = window.Azuren || { app: {}, widget: {} };
    Azuren.init = desk.init;
    Azuren.WindowList = desk.WindowList;
    Azuren.metroList = desk.metroList;
    Azuren.terminal = function (selector, url) {
        return $(selector).Azuren(url).terminal;
    };
    Azuren.system = {};
    Azuren.desktop = {};
    Azuren.shell = {};
    Azuren.core = desk;
    Azuren.desktop.setBackground = Azuren.core.setBackground;
    Azuren.app.list = Azuren.core.iconList;

    Azuren.isIE = navigator.userAgent.indexOf("MSIE") > -1 ? true : false;

    Azuren.app.install = function (id, name, icon, iwidth, iheight, type, tile, callback) {
        desk.iconHelper.addIcon(id, name, icon, iwidth, iheight, type, tile, callback);
    };


    var echo = false;
    var term_exec = function (cmd) {
        cmd = cmd.trim();
        if (cmd == "echo off" || cmd == "@echo off") {
            echo = true;
        } else if (cmd == "echo on" || cmd == "@echo on") {
            echo = false;
        } else {
            if (cmd.indexOf("@") == 0) {
                Azuren.term.exec(cmd.substr(1), true);
            } else {
                Azuren.term.exec(cmd, echo);
            }
        }
    };

    Azuren.shell.show = function (callback) {
        if (Azuren.term.$.is(":hidden")) {
            Azuren.term.focus(true);
            Azuren.term.$.slideDown('fast', callback);
            Azuren.term.attr({
                scrollTop: Azuren.term.attr("scrollHeight")
            });
        }
    };

    Azuren.shell.hide = function () {
        if (Azuren.term.$.is(":visible")) {
            Azuren.term.$.slideUp('fast');
            Azuren.term.focus(false);
            Azuren.term.attr({
                scrollTop: Azuren.term.attr("scrollHeight")
            });
        }
    };

    Azuren.shell.exec = function (data) {
        Azuren.shell.show(function () {
            if (typeof data === "string") {
                term_exec(data);
            } else {
                for (x in data) {
                    term_exec(data[x]);
                }
            }
        });
    };
    Azuren.shell.execFile = function (url) {
        $.get(url, {}, function (e) {
            Azuren.shell.exec(e.split("\n"));
        });
    };
    Azuren.shell.execExternalFile = function (url) {
        $.get("/Helper/HttpGet?url=" + url, {}, function (e) {
            if (e.code == 200) {
                Azuren.shell.exec(e.data.split("\n"));
            }
        });
    };

    Azuren.shell.install = function (command, func) {
        Azuren.term.externalCommands[command] = func;
    };


    var appList = {};
    Azuren.app.uninstall = function (id) {
        delete appList[id];
        if (desk.WindowList.get_window(id)) {
            desk.WindowList.get_window(id).close();
        }

        if (desk.metroList.get_window(id)) {
            desk.metroList.get_window(id).close();
        }

        desk.iconHelper.removeIcon(id);
        Azuren.desktop.removeIcon(id);
    };
    Azuren.app.installEx = function (id, name, icon, url, width, height, iwidth, iheight, type, tile) {
        appList[id] = { name: name, url: url, icon: icon };
        var icn = desk.iconHelper.addIcon(id, name, icon, iwidth, iheight, type, tile, function (app) {
            if (type == 0) {
                desk.frameWindow(id, name, url, width, height, function (e) {
                    e.$content.bind("ready", function () {
                        Azuren.app.sendMessage(id, "event", { name: "ready", data: { id: id } });
                    });
                });
            } else {

                desk.metroFrameWindow(id, name, url, icon, function (e) {
                    if (e.isNew) {
                        Azuren.desktop.startLoading();
                    }
                    e.$content.bind("ready", function () {
                        Azuren.desktop.stopLoading();
                        app.ready();
                        Azuren.app.sendMessage(id, "event", { name: "ready", data: { id: id } });
                    });
                });
            }
        });

    };

    $(document).on('click', ".appbar-item", function () {
        var win = $(this).parents(".metro-win");
        var id = win.data("id");
        Azuren.app.sendMessage(id, "event", { name: "app.appbar", data: { name: $(this).data("name") } });
        win.trigger("appbar", { name: $(this).data("name") });
    });
    var iconMap = {
        "home": 'url("/Scripts/MetroJs/images/metroIcons.jpg") -107px -14px',
        "search": 'url("/Scripts/MetroJs/images/metroIcons.jpg") -16px -14px',
        "remove": 'url("/Scripts/MetroJs/images/metroIcons.jpg") -475px -101px',
        "download": 'url("/Scripts/MetroJs/images/metroIcons.jpg") -475px -14px'
    };

    Azuren.app.setAppBar = function (appId, appBar) {
        var metro = Azuren.metroList.get_window(appId);
        if (appBar.autoHide) {
            metro.$appbar.addClass("appbar-hide");
        } else {
            metro.$appbar.removeClass("appbar-hide");
        }


        if (metro) {
            var menu = appBar.menu;
            if (menu.length == 0) {
                metro.$appbar.hide(0);
                return;
            } else {
                metro.$appbar.show();
            }
            metro.$appbar.animate({ bottom: '-' + (metro.$appbar.height() + 10) + "px" }, 200, function () {
                metro.$appbar.html("");

                for (x in menu) {
                    var item = $("<div>").addClass("appbar-item").attr("data-name", menu[x].name);
                    if (menu[x].background) {
                        item.css("background", menu[x].background);
                    } else {
                        if (iconMap[menu[x].name]) {
                            item.css("background", iconMap[menu[x].name]);
                        } else {
                            item.css("background", 'url("/Scripts/MetroJs/images/metroIcons.jpg") -292px -280px');
                        }
                    }
                    if (menu[x].title) {
                        item.attr("title", menu[x].title);
                    }
                    metro.$appbar.append(item);
                }
                metro.$appbar.animate({ bottom: 0 }, 200);
            });
        }
    };



    Azuren.store = {};
    Azuren.store.view = function (appId) {
        Azuren.showWindow(600, 480, "0002", "Azuren Store", "", function (win) {
            $.get("/Store/View?id=" + appId, {}, function (e) {
                win.$content.html(e);
            });
        });
    };
    Azuren.store.install = function (appId) {
        $.post("/Store/install", { id: appId }, function (e) {
            if (e.code == 0) {
                Azuren.app.installEx(e.data.id, e.data.name, e.data.icon, e.data.url, e.data.width, e.data.height, e.data.iwidth, e.data.iheight, e.data.type, e.data.tile);
            } else {
                Azuren.alert.error("Install app failed");
            }
        });
    };
    Azuren.store.uninstall = function (appId) {
        $.post("/Store/Uninstall", { id: appId }, function (e) {
            if (e.code == 0) {
                Azuren.app.uninstall(appId);
            } else {
                Azuren.alert.error("Uninstall app failed");
            }
        }, "json");
    };

    Azuren.file = {};
    Azuren.file.fileList = function (type, callback) {
        $.post("/File/FileListByType", { type: type }, function (e) {
            callback(e);
        });
    };

    Azuren.system.logout = function () {
        window.location.href = "/Account/logout";
    };

    Azuren.app.setWidth = function (appId, size) {
        var win = Azuren.WindowList.get_window(appId);
        if (win) {
            win.$base.css("width", size + 2 + "px");
        }
    };
    Azuren.app.setHeight = function (appId, size) {
        var win = Azuren.WindowList.get_window(appId);
        if (win) {
            win.$base.css("height", size + win.$titlebar.height() + 12 + "px");
            win.$content.css("height", size + "px");
        }
    };
    Azuren.app.start = function (appId) {
        $("#metro-icon-" + appId).trigger("click");
    };

    var scrollDiv = function (div, distance, duration) {
        div.css("-webkit-transition-duration", (duration / 1000).toFixed(1) + "s");
        div.css("transition-duration", (duration / 1000).toFixed(1) + "s");
        var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
        div.css("-webkit-transform", "translate3d(0px," + value + "px,0px)");
        div.css("transform", "translate3d(0px," + value + "px,0px)");
    };

    Azuren.desktop.addIcon = function (id) {
        if ($('#app-icon-' + id).length == 0) {
            $.post("/Customize/AddDesktopIcon?id=" + id, {}, function (e) {
                if (e.code == 0) {
                    Azuren.desktop.pin(id);
                } else {
                    Azuren.alert.error("Add to desktop failed");
                }
            });
        } else {
            Azuren.alert.error("Desktop icon already exists");
        }
    };
    Azuren.desktop.removeIcon = function (id) {
        if ($('#app-icon-' + id).length > 0) {
            $.post("/Customize/RemoveDesktopIcon?id=" + id, {}, function (e) {
                if (e.code == 0) {
                    Azuren.desktop.unpin(id);
                } else {
                    Azuren.alert.error("Remove desktop icon failed");
                }
            });
        }
    };
    Azuren.desktop.pin = function (id) {
        Azuren.core.gridster.add_widget('<li class="desktop-icon" data-id="' + id + '"><a class="icon app-icon" data-id="' + id + '" id="app-icon-' + id + '" ><img src="' + Azuren.app.list[id].image + '" /><span>' + Azuren.app.list[id].title + '</span></a></li>');
    };
    Azuren.desktop.unpin = function (id) {
        Azuren.core.gridster.remove_widget($('#app-icon-' + id).parents("li"));
    };

    var lockImgUrl = "";
    Azuren.desktop.lock = function () {
        var image = $("#lock-image");

        if (image.length == 0) {
            image = $("<div />")
                .addClass("lock-screen")
                .attr("id", "lock-image");
            var lockImg = $("<img />")
            .addClass("lock-screen-img")
            .attr("src", lockImgUrl);

            image.append(lockImg);
            var wdg = $("<div>").addClass("lock-screen-widget");
            var setTime = function () {
                var timeStr = new Date().toLocaleTimeString() + "<br>" + new Date().toDateString();
                wdg.html(timeStr);
            };

            setTime();
            setInterval(setTime, 1000);
            image.append(wdg);
            $("body").append(image);
            scrollDiv(image, image.height() + 200, 0);
            image
                .css("-webkit-transfrom", "translate3d(0px, -" + (image.height() + 200) + "px, 0px)")
                .css("transfrom", "translate3d(0px, -" + (image.height() + 200) + "px, 0px)")
                .css("visibility", "visible").swipe({
                    triggerOnTouchEnd: true,
                    swipeStatus: function (event, phase, direction, distance, fingers) {
                        if (phase == "move" && (direction == "up")) {
                            var duration = 0;
                            if (direction == "up") {
                                scrollDiv(image, distance, duration);
                            } else {
                                scrollDiv(image, distance, duration);
                            }
                        } else if (phase == "cancel") {
                            scrollDiv(image, 0, 500);
                        } else if (phase == "end") {
                            if (distance > image.width() * 0.2) {
                                Azuren.desktop.unlock();
                            } else {
                                scrollDiv(image, 0, 500);
                            }

                        }
                    }
                });
            image.dblclick(function () {
                Azuren.desktop.unlock();
            });
        }
        scrollDiv(image, 0, 500);
    };

    Azuren.desktop.unlock = function () {
        if ($("#lock-image").length > 0) {
            scrollDiv($("#lock-image"), $("#lock-image").height() + 200, 500);
        }
    };
    Azuren.desktop.setlock = function (url) {
        lockImgUrl = url;
        $.get(url, {}, function () {// This is just for cache
        });
    };

    Azuren.desktop.setTheme = function (theme) {
        $("#theme-css").attr("href", theme);
    };
    Azuren.desktop.clear = function () {
        $("#showdesktop").trigger("click");
    };
    Azuren.desktop.startLoading = function () {
        var loadingDot = $(".loading-dot");
        if (loadingDot.length == 0) {
            loadingDot = $('<div class="loading-dot">');
            loadingDot.appendTo($("body"));

            for (var i = 0; i < 10; ++i) {
                loadingDot.append($('<div class="dot">').css("animation-delay", i * 100 + "ms").css("-webkit-animation-delay", i * 50 + "ms"));
                i++;
            };
        } else {
            loadingDot.show();
        }
    };
    Azuren.desktop.stopLoading = function () {
        $(".loading-dot").hide();
    };

    Azuren.desktop.refresh = function () {
    };

    Azuren.showWindow = function (height, width, id, title, content, callback) {
        return new desk.Window(height, width, title, content, id, callback);
    };

    Azuren.metroWindow = function (id, title, icon, content, callback) {
        return new desk.MetroWindow(id, title, icon, content, callback);
    };


    Azuren.widget.install = function (id, url, width, height) {
        desk.widgets.addItem(id, url, width, height);
    };

    Azuren.app.sendMessage = function (id, type, data) {
        var win = desk.WindowList.get_window(id);
        if (win) {
            var frames = win.$content.find("iframe.win-frame");
            if (frames.length > 0) {
                var frameWin = frames.get(0).contentWindow;
                var a = document.createElement("a");
                a.href = frames.get(0).src;
                frameWin.postMessage({ type: type, data: data }, "*");
            }
        }
    };

    Azuren.browser = {};


    var serverEvents = {
        "app_msg": function (data) {
            if (data.data['content']) {
                Azuren.notify(appList[data.appId].name, data.data["content"]);
            } else {
                Azuren.notify(appList[data.appId].name, "");
            }
        }
    };
    //==Azuren Hub Connection
    Azuren.hub = $.connection.azurenHub;
    $.connection.hub.start().done(function () {
    });

    Azuren.hub.client.HandleMessage = function (type, content) {
        if (serverEvents[type]) serverEvents[type](content);
    };

    Azuren.events = {};
    Azuren.notify = function (title, text) {
        $.pnotify({ title: title, text: text, hide: true, history: false, delay: 2000, animation: { effect_in: "show", effect_out: "fade" } });
    };

    Azuren.events['alert'] = function (id, data) {
        console.dir(data);
    };

    Azuren.events["postMessage"] = function (id, data, callback) {
    };

    Azuren.events["notify"] = function (id, data) {
        Azuren.notify(data.title, data.text);
    };

    Azuren.events["alert.success"] = function (id, data, callback) {
        Azuren.alert.success(data.content, data.time, callback);
    };
    Azuren.events["alert.info"] = function (id, data, callback) {
        Azuren.alert.info(data.content, data.time, callback);
    };
    Azuren.events["alert.warn"] = function (id, data, callback) {
        Azuren.alert.warn(data.content, data.time, callback);
    };
    Azuren.events["alert.error"] = function (id, data, callback) {
        Azuren.alert.error(data.content, data.time, callback);
    };

    Azuren.events["system.logout"] = function (id, data) {
        Azuren.system.logout();
    };
    Azuren.events["desktop.setBackground"] = function (id, data) {
        Azuren.desktop.setBackground(data.url);
    };
    Azuren.events["desktop.lock"] = function (id, data) {
        Azuren.desktop.lock();
    };
    Azuren.events["desktop.unlock"] = function (id, data) {
        Azuren.desktop.unlock();
    };

    Azuren.events["desktop.clear"] = function (id, data) {
        Azuren.desktop.clear();
    };
    Azuren.events["desktop.setTheme"] = function (id, data) {
        Azuren.desktop.setTheme(data.theme);
    };

    Azuren.events["desktop.setlock"] = function (id, data) {
        Azuren.desktop.setlock(data.url);
    };
    Azuren.events["desktop.refresh"] = function (id, data) {
        Azuren.desktop.refresh();
    };
    Azuren.events["app.setWidth"] = function (id, data) {
        Azuren.app.setWidth(id, data.size);
    };
    Azuren.events["app.setHeight"] = function (id, data) {
        Azuren.app.setHeight(id, data.size);
    };
    Azuren.events["app.setAppBar"] = function (id, data) {
        Azuren.app.setAppBar(id, data.appbar);
    };
    Azuren.events["store.install"] = function (id, data) {
        Azuren.store.install(data.id);
    };
    Azuren.events["store.uninstall"] = function (id, data) {
        Azuren.store.uninstall(data.id);
    };
    Azuren.events["browser.open"] = function (id, data) {
        Azuren.browser.open(data.url);
    };
    Azuren.events["app.start"] = function (id, data) {
        Azuren.app.start(data.id);
    };
    Azuren.events["file.fileList"] = function (id, data) {
        Azuren.file.fileList(data.type, data.callback);
    };

    Azuren.prompt = function (title, value, callback) {
        $.MetroMessageBox({ title: "", content: title, NormalButton: "#232323", ActiveButton: "#1ba1e2", buttons: "[Cancel][Accept]", input: "text", value: value }, function (a, b) {
            if (a == "Accept") {
                callback(b);
            }
        });
    };
    Azuren.confirm = function(title, buttons, callback) {
        $.MetroMessageBox({ content: title, NormalButton: "#232323", ActiveButton: "#1ba1e2", buttons: buttons}, function (a, b) {
            callback(a);
        });
    };
    Azuren.alert = function (title, content, callback) {
        $.MetroMessageBox({ title: title, content: content, NormalButton: "#232323", ActiveButton: "#0050ef" }, callback);
    };
    var notifyDialog = function (content, time, type, callback) {
        var infoDialog = $("#info-box-dialog");
        if (infoDialog.length == 0) {
            infoDialog = $('<div id="info-box-dialog" class="info-dialog modal-dialog"><div class="modal-content" style="padding-bottom:0;"><div class="modal-body"></div></div></div>');
            $("body").append(infoDialog);
        }
        time = time || 2000;
        type && infoDialog.find(".modal-content").addClass("alert-" + type).addClass("alert");
        infoDialog.css("visibility", "hidden").find(".modal-body").html(content);
        infoDialog.css("top", "-" + (infoDialog.height() + 1) + "px").css("visibility", "visible");
        infoDialog.animate({ top: "-5px" }, 100, function () {
            setTimeout(function () {
                infoDialog.animate({ "top": "-" + (infoDialog.height() + 50) + "px" }, 100, function () {
                    type && infoDialog.find(".modal-content").removeClass("alert-" + type).removeClass("alert");
                    callback && callback();
                });
            }, time);
        });
        infoDialog.click(function () {

            infoDialog.animate({ "top": "-" + (infoDialog.height() + 20) + "px" }, 100, function () {
                type && infoDialog.find(".modal-content").removeClass("alert-" + type).removeClass("alert");
                callback && callback();
            });

        });
    };

    Azuren.alert.success = function (content, time, callback) { notifyDialog(content, time, "success", callback); };
    Azuren.alert.info = function (content, time, callback) { notifyDialog(content, time, "info", callback); };
    Azuren.alert.warn = function (content, time, callback) { notifyDialog(content, time, "warning", callback); };
    Azuren.alert.error = function (content, time, callback) {
        notifyDialog(content, time, "danger", callback);
    };


    window.addEventListener("message", function (e) {
        var iframe = null;
        $("iframe").each(function (a, b) {
            if (b.contentWindow == e.source) {
                iframe = b;
                return false;
            }
        });
        if (iframe) {
            if (Azuren.events[e.data.method]) {
                if (e.data.callback)
                    Azuren.events[e.data.method]($(iframe).data("id"), e.data.data, function (data) {
                        Azuren.app.sendMessage($(iframe).data("id"), e.data.callback, data);
                    });
                else
                    Azuren.events[e.data.method]($(iframe).data("id"), e.data.data);

            }
        }
    }, false);
})(jQuery, nJDSK);