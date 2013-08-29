var Store = {};
var iconImage = "/Images/icons/metro/store.png";
Azuren.app.install("0002", "Store", iconImage, function (e) {
    Azuren.metroWindow("0002", "Store", iconImage, function (win) {
        if (win.isNew) {
            $.get("/Store/Index", {}, function (e) {
                win.$content.html(e);
                win.$content.on("click", ".store-app", function (e) {
                    $.get("/Store/View?id=" + $(this).data("id"), {}, function (e) {
                        win.$content.html(e);
                    });
                });
                win.$content.on("click", ".store-home", function (e) {
                    e.preventDefault();
                    $.get("/Store/Index", {}, function (e) {
                        win.$content.html(e);
                    });
                });
                win.$content.on("submit", ".store-search-form", function (e) {
                    e.preventDefault();
                    alert("Not implement yet");
                });

                win.$content.on("click", ".va-setup", function (e) {
                    var id = $(this).data("id");
                    var btn = $(this);
                    $.post("/Store/Install", { id: id }, function (e) {
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
}, function (app) {
    app.tile.html([
                    '<div><img class="full" src="', iconImage, '" width="110" height="110" style="margin-top: 10px"/></div>',
                    '<div class="tile-textview">App Store<br /> Your Apps Here!</div>'
    ].join(""));
    app.tile.removeClass(function (index, css) {
        return (css.match(/\bwidget_\S+/g) || []).join(" ");
    });

    app.tile.addClass("orange");
    app.tile.liveTile({
        mode: "carousel",
        direction:"horizonal"
    });
    
});