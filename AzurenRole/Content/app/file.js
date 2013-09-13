Azuren.file.edit = function (path) {
    var id = path.replace("-", "--").replace("_", "__").replace("/", "-").replace(".", "_");
    Azuren.showWindow(600, 480, "0005editor-" + id, "Edit: " + path, "", function (win) {

        if (win.isNew) {

            var loadContent = function () {
                $.ajax({ url: "/File/Detail?path=" + path + "&stamp=" + new Date().getTime(), type: "get" })
                .fail(function () {
                    Azuren.alert.error("File Not Exists.", 400);
                    win.close();
                })
                    .done(function (e) {
                        var contentArea = $("<textarea>").css("width", "100%").css("height", "100%");
                        win.$content.html(contentArea);
                        contentArea.val(e);
                        var change = false;
                        win.$closeBtn.unbind("click");
                        win.$closeBtn.click(function () {
                            if (change) {
                                Azuren.confirm("Changes not saved! Are you sure to exit?", "[Cancel][Discard][SaveAndExit]", function (e) {
                                    switch (e) {
                                        case "Cancel":
                                            {

                                            }
                                            break;
                                        case "Discard":
                                            {
                                                win.close();
                                            }
                                            break;
                                        case "SaveAndExit":
                                            {
                                                saveContent(function (e) {
                                                    if (e) {
                                                        win.close();
                                                    } else {
                                                        Azuren.alert("An error occurred while saving your file");
                                                    }
                                                });
                                            }
                                            break;
                                    }
                                });
                            } else {
                                win.close();
                            }
                        });
                        
                        var saveContent = function (callback) {
                            $.post("/File/UpdateText", { name: path, path: "", content: contentArea.val() }, function (e) {
                                if (e.code == 0) {
                                    callback(true);
                                } else {
                                    callback(false);
                                }
                            });
                        };

                        contentArea.keydown(function (e) {
                            if (e.ctrlKey && e.keyCode == "83") {
                                e.preventDefault();
                                saveContent(function (e) {
                                    if (e) {
                                        Azuren.alert.info("File saved", 1000);
                                        change = false;
                                    } else {
                                        Azuren.alert.error("Update file failed");
                                    }
                                });
                            } else {
                                change = true;
                            }
                        });
                    });
            };

            win.setTaskbarBtn("/Images/icons/filetypes/empty.png");
            win.$content.html('<img src="/Images/jar-loading.gif" style="display:block;margin: 0 auto;" />');
            loadContent();
        }
    });
};

Azuren.app.install("0005", "Files", "/Images/icons/metro/file.png", 2, 1, 0, function () {
}, function (e) {
    Azuren.showWindow(600, 480, "0005", "Files", "", function (win) {
        if (win.isNew) {
            var pasteCmd = null;
            var pasteBoard = null;


            var navigateTo = function (path) {
                win.$content.html('<img src="/Images/jar-loading.gif" style="display:block;margin: 0 auto;" />');
                $.post("File/Index", { path: path }, function (e) {
                    win.$content.html(e);
                    win.$content.find(".files-list").data("path", path);
                });
            };

            $(document).on("dragover", ".files-list", function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            $(document).on("drop", ".files-list", function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).css("box-shadow", "none");
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    for (var x = 0 ; x < files.length; x++) {
                        var formData = new FormData();
                        formData.append("file", files[x]);
                        formData.append("name", files[x].name);
                        formData.append("path", $(".files-list").data("path"));
                        Azuren.desktop.startLoading();
                        $.ajax({
                            url: "/File/Upload",
                            contentType: false,
                            cache: false,
                            processData: false,
                            type: "POST",
                            dataType: "json",
                            data: formData,
                            success: function (e) {
                                Azuren.desktop.stopLoading();
                                if (e.code != 0) {
                                    Azuren.alert.error(e.data);
                                } else {
                                    navigateTo($(".files-list").data("path"));
                                }
                            },
                            error: function (e) {
                                Azuren.desktop.stopLoading();
                                Azuren.alert.error(e);
                            }
                        });
                    }
                }
            });


            $(document).on("click", ".file-item", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if ($(this).hasClass("item-folder")) {
                    navigateTo($(this).data("path"));
                } else {
                    var temp = $(this).data("name").split(".");
                    var fileext = "";
                    if (temp.length > 0) {
                        fileext = temp[temp.length - 1];
                    }
                    if ($(this).data("type").indexOf("image") == 0) {
                        var t = $(this);
                        if ($("#fancybox-container").length > 0) {
                            $("#fancybox-container").remove();
                        }

                        var p = $("<p/>").attr("id", "fancybox-container");
                        var location = 0;
                        $("[data-type^=image]").each(function (i, b) {
                            var a = $("<a>");
                            a.addClass("fancybox").attr("href", "/File/Detail?path=" + $(b).data("path")).attr("data-fancybox-group", "gallery").attr("title", $(b).data("name"));
                            p.append(a);
                            if ($(b).data("name") == t.data("name")) {
                                location = i;
                            }
                        });

                        $("body").append(p);
                        $(".fancybox").fancybox().eq(location).trigger("click");
                    } else if (fileext === "abf") {
                        Azuren.shell.execFile("/File/Detail?path=" + $(this).data("path") + "&stamp="+new Date().getTime());
                    }
                    else {
                        Azuren.alert.warn("File type not supported");
                    }
                }
            });

            $(document).on("click", ".file-up-btn", function (e) {
                if ($("#select_up_file").length == 0) {

                    var form = $('<form enctype="multipart/form-data" id="file_upload_form"><input name="file" type="file" id="select_up_file"/> </form>');
                    $("body").append(form);
                    $(document).on("change", '#select_up_file', function (e) {
                        var file = $(this).get(0);
                        if (file.files.length > 0) {
                            var formData = new FormData($("#file_upload_form").get(0));
                            formData.append("name", file.files[0].name);

                            formData.append("path", $(".files-list").data("path"));
                            Azuren.desktop.startLoading();
                            $.ajax({
                                url: "/File/Upload",
                                contentType: false,
                                cache: false,
                                processData: false,
                                type: "POST",
                                dataType: "json",
                                data: formData,
                                success: function (e) {
                                    Azuren.desktop.stopLoading();
                                    $("#select_up_file").replaceWith($("#select_up_file").clone(true));
                                    navigateTo($(".files-list").data("path"));
                                },
                                error: function () {
                                    Azuren.desktop.stopLoading();
                                }
                            });
                        }
                    });
                    form.find("#select_up_file").trigger("click");
                } else {
                    $("#select_up_file").trigger("click");
                }



                return false;
            });

            $(document).on("click", ".files-nav li a", function (e) {
                var li = $(this).parents("li");
                navigateTo(li.data("path"));
            });

            $.contextMenu({
                selector: '.file-item',
                callback: function (key, options) {
                    var folderPath = $(this).parents(".files-list").data("path");
                    var item = $(this);
                    switch (key) {
                        case "rename":
                            {
                                Azuren.prompt("Rename", $(this).data("name"), function (name) {
                                    $.post("/File/Move", { path1: item.data("path"), path2: folderPath + "/" + name }, function (e) {
                                        if (e.code == 0) {
                                            navigateTo(folderPath);
                                        } else {
                                            Azuren.alert.error(e.data);
                                        }
                                    }, "json");
                                });
                            }
                            break;
                        case "delete":
                            {
                                var path = $(this).data("path");
                                $.post("/File/Delete", { path: path }, function (e) {
                                    if (e.code == 0) {
                                        item.remove();
                                    } else {
                                        Azuren.alert.error(e.data);
                                    }
                                });
                            }
                            break;
                        case "edit":
                            {
                                Azuren.file.edit($(this).data("path"));
                            } break;
                        case "copy":
                            {
                                pasteCmd = "copy";
                                pasteBoard = $(this).data("path");
                            }
                            break;
                        case "cut":
                            {
                                pasteCmd = "cut";
                                pasteBoard = $(this).data("path");
                            }
                            break;
                        case "setback":
                            {
                                $.post("/Customize/SetDesktop", { url: "/File/Detail?path=" + $(this).data("path") }, function (e) {
                                    if (e.code == 0) {
                                        Azuren.desktop.setBackground(e.data.Desktop);
                                    } else {
                                        Azuren.alert.error("Set background failed");
                                    }
                                });
                            } break;
                        case "download":
                            {
                                $.fileDownload("/File/Download?name=" + $(this).data('name') + "&path=" + $(this).parents(".files-list").data('path'));
                            }
                            break;

                    }
                },
                items: {
                    "edit": {
                        name: "Edit", disabled: function () {
                            return $(this).hasClass("item-folder");
                        }
                    },
                    "rename": { name: "Rename" },
                    "delete": { name: "Delete" },
                    "copy": { name: "Copy" },
                    "cut": { name: "Cut" },
                    "setback": {
                        name: "Set As Background", disabled: function () {
                            return $(this).data("type").indexOf("image") != 0;
                        }
                    },
                    "download": {
                        name: "Download", disabled: function () {
                            return $(this).hasClass("item-folder");
                        }
                    }
                }
            });

            $.contextMenu({
                selector: ".files-list",
                callback: function (key, options) {
                    var path = $(this).data("path");
                    switch (key) {
                        case "upload":
                            $(".file-up-btn").trigger("click");
                            break;
                        case "paste":
                            {
                                if (pasteCmd == "cut") {
                                    console.dir("cut " + pasteBoard + " to " + path);
                                    $.post("/File/Move", { path1: pasteBoard, path2: path }, function (e) {
                                        if (e.code == 0) {
                                            navigateTo(path);
                                        } else {
                                            Azuren.alert.error(e.data);
                                        }
                                    });
                                    pasteCmd = null;
                                    pasteBoard = null;
                                } else if (pasteCmd == "copy") {
                                    $.post("/File/Copy", { path1: pasteBoard, path2: path }, function (e) {
                                        if (e.code == 0) {
                                            navigateTo(path);
                                        } else {
                                            Azuren.alert.error(e.data);
                                        }
                                    }, "json");
                                }
                            } break;
                        case "refresh":
                            {
                                navigateTo($(this).data("path"));
                            } break;
                        case "createfolder":
                            {
                                Azuren.prompt("Create Folder", "", function (name) {
                                    $.post("/File/CreateFolder", { path: path, name: name }, function (e) {
                                        if (e.code == 0) {
                                            navigateTo(path);
                                        } else {
                                            Azuren.alert.error(e.data);
                                        }
                                    }, "json");
                                });

                            } break;
                    }
                },
                items: {
                    "refresh": {
                        name: "Refresh"
                    },
                    "paste": {
                        name: "Paste", disabled: function () {
                            return !pasteBoard;
                        }
                    },
                    "upload": { name: "Upload" },
                    "createfolder": { name: "Create Folder" }
                }
            });

            navigateTo("/");
        }
    });
});