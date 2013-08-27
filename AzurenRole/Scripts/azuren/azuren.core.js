(function ($) {
    $.fn.Azuren = function (url, options) {
        if ($('body').data('azuren-term')) {
            return $('body').data('azuren-term').terminal;
        }
        this.addClass('azuren-term');
        options = options || {};
        var settings = {
            prompt: 'Azuren / >',
            name: 'azuren',
            enabled: false,
            greetings: "Welcome to use azuren console",
            keypress: function (e) {
                if (e.which == 96) {
                    return false;
                }
            },
            processArguments: false,
            env: {
                path: "/"
            },
            afterCmd: {
                cd: function (args, term, result) {
                    if (result.code == 0) {
                        term.env.path = result.data;
                        term.set_prompt("Azuren " + term.env.path + " >");
                        return true;
                    }
                },
                download: function (args, term, result) {
                    if (result.code == 0) {
                        console.dir(result);
                        $.fileDownload("/File/Download?name=" + args[0] + "&path=" + term.env.path);
                        return true;
                    }
                }
            },
            beforeCmd: {
                cd: function (term, args) {
                    if (args[0] == "/") {
                        term.env.path = "/";
                        term.set_prompt("Azuren " + term.env.path + " >");
                        return true;
                    }
                    return false;
                },
                download: function (term, args) {
                    if (args.length < 1) {
                        term.error("Usage: donwload filename");
                        return true;
                    }
                },
                app: function (term, args) {
                    if (args.length == 2) {
                        if (args[0] == "install") {
                            term.pause();
                            $.post("/Store/Install", { id: args[1] }, function (e) {
                                if (e.code == 0) {
                                    term.echo("App \"" + e.data.name + "\" installed successfully.");
                                } else {
                                    term.error("App install failed");
                                }
                                term.resume();
                            }, "json");
                            return true;
                        } else if (args[0] == "uninstall") {
                            term.pause();
                            $.post("/Store/Uninstall", { id: args[1] }, function (e) {
                                if (e.code == 0) {
                                    term.echo("App removed successfully.");
                                } else {
                                    term.error("Remove app failed");
                                }
                                term.resume();
                            }, "json");
                            return true;
                        } else if (args[0] == "start") {
                            Azuren.app.start(args[1]);
                            return true;
                        }
                    }
                    term.error("Usage: app [install | uninstall] app_id");
                    return true;
                },
                upload: function (term, args) {
                    if (args.length < 1) {
                        term.error("Usage: upload filename");
                        return true;
                    }
                    if ($("#select_file_term").length == 0) {
                        var form = $('<form enctype="multipart/form-data" id="file_term_form"><input name="file" type="file" id="select_file_term"/> </form>');
                        $("body").append(form);
                        $(document).on("change", '#select_file_term', function (e) {
                            var file = $(this).get(0);
                            if (file.files.length > 0) {
                                var formData = new FormData($("#file_term_form").get(0));
                                formData.append("args", $(this).data("args"));
                                formData.append("path", term.env.path);
                                $.ajax({
                                    url: "/Console/Upload",
                                    contentType: false,
                                    cache: false,
                                    processData: false,
                                    type: "POST",
                                    dataType: "json",
                                    data: formData,
                                    success: function (e) {
                                        $("#select_file_term").replaceWith($("#select_file_term").clone(true));
                                        term.echo("File upload successfully");
                                    },
                                    error: function () {
                                        term.error("File upload failed");
                                    }
                                });
                            }
                        });
                    }
                    $("#select_file_term").data("args", args).click();
                    return true;
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
///
(function ($, desk) {
    window.Azuren = window.Azuren || { app: {}, widget: {} };
    Azuren.init = desk.init;
    Azuren.WindowList = desk.WindowList;
    Azuren.terminal = function (selector, url) {
        $(selector).Azuren(url);
    };
    Azuren.system = {};
    Azuren.desktop = {};
    Azuren.desktop.setBackground = nJDSK.setBackground;
    Azuren.isIE = navigator.userAgent.indexOf("MSIE") > -1 ? true : false;
    Azuren.app.install = function (id, name, icon, callback) {
        var icon = desk.iconHelper.addIcon(id, name, icon, callback);
        $.contextMenu({
            selector: icon.selector,
            callback: function (key, options) {
                var appId = $(this).data("id");
                switch (key) {
                    case "open":
                        break;
                }
            },
            items: {
                "open": { name: "Open" }
            }
        });
    };
    var appList = {};
    Azuren.app.uninstall = function (id) {
        delete appList[id];
        desk.iconHelper.removeIcon(id);
    };
    Azuren.app.installEx = function (id, name, icon, url, width, height) {
        appList[id] = { name: name, url: url, icon: icon };
        var icon = desk.iconHelper.addIcon(id, name, icon, function () {
            desk.frameWindow(id, name, url, width, height, function (e) {
                e.$content.bind("ready", function () {
                    Azuren.app.sendMessage(id, "event", { name: "ready", data: { id: id } });
                });
            });
        });
        $.contextMenu({
            selector: icon.selector,
            callback: function (key, options) {
                var appId = $(this).data("id");
                switch (key) {
                    case "open":
                        {
                            $(this).trigger("click");
                        }
                        break;
                    case "uninstall":
                        Azuren.store.uninstall(appId);
                        break;
                    case "store":
                        Azuren.store.view(appId);
                        break;
                }
            },
            items: {
                "open": { name: "Open" },
                "uninstall": { name: "Uninstall" },
                "store": { name: "View in app store" }
            }
        });
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
                Azuren.app.installEx(e.data.id, e.data.name, e.data.icon, e.data.url, e.data.width, e.data.height);
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
    Azuren.app.start = function(appId) {
        $("#app-icon-" + appId).trigger("click");
    };

    var scrollDiv = function (div, distance, duration) {
        div.css("-webkit-transition-duration", (duration / 1000).toFixed(1) + "s");
        div.css("transition-duration", (duration / 1000).toFixed(1) + "s");
        var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
        div.css("-webkit-transform", "translate3d(0px," + value + "px,0px)");
        div.css("transform", "translate3d(0px," + value + "px,0px)");
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
    };

    Azuren.desktop.setTheme = function (theme) {
        $("#theme-css").attr("href", "/Content/themes/" + theme + ".css");
    };
    Azuren.desktop.clear = function () {
        $("#showdesktop").trigger("click");
    };
    Azuren.desktop.refresh = function () {
        for (var x in appList) {
            Azuren.app.uninstall(x);
        }
        $.getJSON("/Home/App", {}, function (e) {
            for (x in e.data) {
                Azuren.app.installEx(e.data[x].id, e.data[x].name, e.data[x].icon, e.data[x].url, e.data[x].width, e.data[x].height);
            }
        });
    };

    Azuren.showWindow = function (height, width, id, title, content, callback) {
        return new desk.Window(height, width, title, content, id, callback);
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

    Azuren.events["desktop.clear"] = function(id, data) {
        Azuren.desktop.clear();
    };
    Azuren.events["desktop.setTheme"] = function(id, data) {
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
    Azuren.events["store.install"] = function (id, data) {
        Azuren.store.install(data.id);
    };
    Azuren.events["store.uninstall"] = function (id, data) {
        Azuren.store.uninstall(data.id);
    };
    Azuren.events["browser.open"] = function(id, data) {
        Azuren.browser.open(data.url);
    };
    Azuren.events["app.start"] = function(id, data) {
        Azuren.app.start(data.id);
    };
     
    Azuren.prompt = function (title, value, callback) {
        var confirmDialog = $(['<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">',
            '<div class="modal-dialog">',
            ' <div class="modal-content">',
            '  <div class="modal-header">',
            '   <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
            '  <h4 class="modal-title">' + title + '</h4>',
            '</div>',
            '<div class="modal-body">',
            '<input type="text" class="prompt-content form-control" value="' + value + '"/>',
            '</div>',
            '<div class="modal-footer">',
            ' <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>',
            ' <button type="button" class="btn btn-primary modal-ok-btn">Ok</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'].join(""));
        $("body").append(confirmDialog);
        confirmDialog.modal("show");
        confirmDialog.find(".modal-ok-btn").click(function () {
            callback(confirmDialog.find(".prompt-content").val());
            confirmDialog.modal("hide");
        });
    };
    Azuren.alert = function (title, content, callback) {
        var alertDialog = $(['<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">',
            '<div class="modal-dialog">',
            ' <div class="modal-content">',
            '  <div class="modal-header">',
            '   <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
            '  <h4 class="modal-title">' + title + '</h4>',
            '</div>',
            '<div class="modal-body">',
            content,
            '</div>',
            '<div class="modal-footer">',
            ' <button type="button" class="btn btn-primary modal-ok-btn">Ok</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'].join(""));
        $("body").append(alertDialog);
        alertDialog.modal("show");
        alertDialog.find(".modal-ok-btn").click(function () {
            alertDialog.modal("hide");
            callback && callback();
        });
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
                infoDialog.animate({ "top": "-" + (infoDialog.height() + 1) + "px" }, 100, function () {
                    type && infoDialog.find(".modal-content").removeClass("alert-" + type).removeClass("alert");
                    callback && callback();
                });
            }, time);
        });
        infoDialog.click(function () {
            infoDialog.animate({ "top": "-" + (infoDialog.height() + 1) + "px" }, 100, function () {
                type && infoDialog.find(".modal-content").removeClass("alert-" + type).removeClass("alert");
                callback && callback();
            });
        });
    };
    Azuren.alert = {};
    Azuren.alert.success = function (content, time, callback) { notifyDialog(content, time, "success", callback); };
    Azuren.alert.info = function (content, time, callback) { notifyDialog(content, time, "info", callback); };
    Azuren.alert.warn = function (content, time, callback) { notifyDialog(content, time, "warning", callback); };
    Azuren.alert.error = function (content, time, callback) { notifyDialog(content, time, "danger", callback); };


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