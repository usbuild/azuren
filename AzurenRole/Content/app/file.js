Azuren.app.install("0005", "Files", "/Images/icons/file.png", function (e) {
    

    Azuren.showWindow(600, 480, "0005", "Files", "", function (win) {
        if (win.isNew) {

            var navigateTo = function(path) {
                $.post("File/Index", { path: path }, function (e) {
                    win.$content.html(e);
                    win.$content.find(".files-list").data("path", path);
                });
            };


            $(document).on("click", ".file-item", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if ($(this).hasClass("item-folder")) {
                    navigateTo($(this).data("path"));
                } else {
                    if ($(this).data("type").indexOf("image") == 0) {

                        var t = $(this);
                        if ($("#fancybox-conatiner").length > 0) {
                            $("#fancybox-conatiner").remove();
                        }
                        
                        var p = $("<p/>").attr("id", "#fancybox-conatiner");
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
                    }
                }
            });

            $(document).on("click", ".file-up-btn", function (e) {
                if ($("#select_file_file").length == 0) {
                    
                    var form = $('<form enctype="multipart/form-data" id="file_upload_form"><input name="file" type="file" id="select_up_file"/> </form>');
                    $("body").append(form);
                    $(document).on("change", '#select_up_file', function (e) {
                        var file = $(this).get(0);
                        if (file.files.length > 0) {
                            var formData = new FormData($("#file_upload_form").get(0));
                            formData.append("name", file.files[0].name);

                            formData.append("path", $(".files-list").data("path"));
                            $.ajax({
                                url: "/File/Upload",
                                contentType: false,
                                cache: false,
                                processData: false,
                                type: "POST",
                                dataType: "json",
                                data: formData,
                                success: function (e) {
                                    $("#select_up_file").replaceWith($("#select_up_file").clone(true));
                                    navigateTo($(".files-list").data("path"));
                                },
                                error: function () {
                                    
                                }
                            });
                        }
                    });
                    form.find("#select_up_file").trigger("click");
                }




                return false;
            });

            $(document).on("click", ".files-nav li a", function(e) {
                var li = $(this).parents("li");
                navigateTo(li.data("path"));
            });
            navigateTo("/");
        }
    });
});