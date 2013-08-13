var Store = {};
Azuren.app.install("0002", "Store", "/Images/icons/store.png", function (e) {
    Azuren.showWindow(600, 480, "0001", "Azuren Store", "", function (win) {
        if (win.isNew) {
            $.get("/Store/Index", {}, function(e) {
                win.$content.html(e);
                win.$content.on("click", ".store-app", function (e) {
                    $.get("/Store/View?id=" + $(this).data("id"), {}, function (e) {
                        win.$content.html(e);
                    });
                });
                win.$content.on("click", ".store-home", function(e) {
                    e.preventDefault();
                    $.get("/Store/Index", {}, function(e) {
                        win.$content.html(e);
                    });
                });
                win.$content.on("submit", ".store-search-form", function(e) {
                    e.preventDefault();
                    alert("Not implement yet");
                });

                win.$content.on("click", ".va-setup", function (e) {
                    var id = $(this).data("id");
                    var btn = $(this);
                    $.post("/Store/Install", { id: id }, function(e) {
                        if (e.code == 0) {
                            btn.removeClass("va-setup").addClass("va-installed").attr("disabled", "disabled").html("installed");
                            Azuren.app.installEx(e.data.id, e.data.name, e.data.icon, e.data.url, e.data.width, e.data.height);
                        } else {
                            alert("Install failed");
                        }
                    }, "json");
                });
            });
        }
    });
});