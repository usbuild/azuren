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

    Azuren.prompt = function(title, value, callback) {
        var confirmDialog = $(['<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">',
            '<div class="modal-dialog">',
            ' <div class="modal-content">',
            '  <div class="modal-header">',
            '   <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
            '  <h4 class="modal-title">'+title+'</h4>',
            '</div>',
            '<div class="modal-body">',
            '<input type="text" class="prompt-content form-control" value="'+value+'"/>',
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
    Azuren.alert = function(title, content, callback) {
        var alertDialog = $(['<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">',
            '<div class="modal-dialog">',
            ' <div class="modal-content">',
            '  <div class="modal-header">',
            '   <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
            '  <h4 class="modal-title">'+title+'</h4>',
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
    var notifyDialog = function(content, time, type, callback) {
        var infoDialog = $("#info-box-dialog");
        if (infoDialog.length == 0) {
            infoDialog = $('<div id="info-box-dialog" class="info-dialog modal-dialog"><div class="modal-content" style="padding-bottom:0;"><div class="modal-body"></div></div></div>');
            $("body").append(infoDialog);
        }
        time = time || 2000;
        type && infoDialog.find(".modal-content").addClass("alert-"+type).addClass("alert");
        infoDialog.css("visibility", "hidden").find(".modal-body").html(content);
        infoDialog.css("top", "-" + (infoDialog.height() + 1) + "px").css("visibility", "visible");
        infoDialog.animate({ top: "-5px" }, 100, function () {
            setTimeout(function () {
                infoDialog.animate({ "top": "-" + (infoDialog.height() + 1) + "px" }, 100, function () {
                    type && infoDialog.find(".modal-content").removeClass("alert-"+type).removeClass("alert");
                    callback && callback();
                });
            }, time);
        });
        infoDialog.click(function() {
                infoDialog.animate({ "top": "-" + (infoDialog.height() + 1) + "px" }, 100, function () {
                    type && infoDialog.find(".modal-content").removeClass("alert-"+type).removeClass("alert");
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