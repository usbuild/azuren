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
                    $.fileDownload("/Console/Download?name=" + args[0] + "&path=" + term.env.path);
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
    Azuren.setBackground = nJDSK.setBackground;
    Azuren.isIE = navigator.userAgent.indexOf("MSIE") > -1 ? true : false;
    Azuren.app.install = function (id, name, icon, callback) {
        desk.iconHelper.addIcon(id, name, icon, callback);
    };
    var appList = {};
    Azuren.app.installEx = function (id, name, icon, url, width, height) {
        appList[id] = { name: name, url: url, icon: icon };
        desk.iconHelper.addIcon(id, name, icon, function () {
            desk.frameWindow(id, name, url, width, height, function (e) {
                e.$content.bind("ready", function () {
                    Azuren.app.sendMessage(id, "event", { name: "ready", data: { id: id } });
                });
            });
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