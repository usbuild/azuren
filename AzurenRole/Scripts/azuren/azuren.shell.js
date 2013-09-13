(function ($) {
    $.fn.Azuren = function (url, options) {
        if ($('body').data('azuren-term')) {
            return $('body').data('azuren-term').terminal;
        }
        this.addClass('azuren-term');
        options = options || {};
        var apmList = [];
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
                        $.fileDownload("/File/Download?name=" + args[0] + "&path=" + term.env.path);
                        return true;
                    }
                }
            },
            beforeCmd: {
                apm: function (term, args) {



                    var caan = "http://lecoding.com:8000/caan/";
                    if (args.length < 2) {
                        term.error("Usage: apm install xxx");
                    } else {

                        if (args[0] == "install") {
                            if (apmList.indexOf(args[1]) != -1) {
                                term.echo("`" + args[1] + "` already exists in your system.");
                                return true;
                            }
                            term.pause();
                            var install = function (name, callback) {
                                var path = caan + name;
                                var e = $.ajax({
                                    type: "GET",
                                    async: false,
                                    url: "/Helper/HttpGet?url=" + path + "/package.json"
                                }).responseText;
                                e = JSON.parse(e);
                                if (e.code == 200) {
                                    var packageInfo = eval(JSON.parse(e.data));
                                    term.echo("Resolving dependence ...");
                                    term.echo(name + " depends on " + JSON.stringify(packageInfo.depends));
                                    for (x in packageInfo.depends) {
                                        if (apmList.indexOf(packageInfo.depends[x]) == -1) {
                                            install(packageInfo.depends[x]);
                                        }
                                    }
                                    term.echo("Installing " + name + " ...");
                                    apmList.push(name);
                                    $.getScript(path + "/main.js", function () {
                                        term.echo(name + " installed.");
                                        callback && callback();
                                    });
                                } else {
                                    term.error("package not exists.");
                                    callback && callback();
                                }
                            };

                            install(args[1], function () {
                                term.echo(" ");
                                term.resume();
                            });
                        }
                    }
                    return true;
                },
                js: function (term, args) {
                    term.push(function (command, terminal) {
                        if (command !== '') {
                            try {
                                var result = window.eval(command);
                                if (result !== undefined) {
                                    term.echo(new String(result));
                                }
                            } catch (e) {
                                term.error(new String(e));
                            }

                        } else {
                            term.echo('');
                        }
                    }, {
                        prompt: 'js>'
                    });
                    return true;
                },
                load: function (term, args) {
                    if (args.length < 1) {
                        term.error("Usage: load remotefile.js");
                    } else {
                        $.getScript(args, function () {
                            term.echo("Plugin loaded");
                        });
                    }
                    return true;
                },
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
                        term.error("Usage: download filename");
                        return true;
                    }
                },
                edit: function(term, args) {
                  if (args.length < 1) {
                      term.error("Usage: edit file");
                      return true;
                  } else {
                      Azuren.shell.hide();
                      Azuren.file.edit(term.env.path + "/" + args[0]);
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
        self.terminal.externalCommands = {};
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
        self.terminal.$ = self;
        return self;
    };
})(jQuery);