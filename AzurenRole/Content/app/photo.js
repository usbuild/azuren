(function () {
    var iconImage = "/Images/icons/metro/photos.png";

    Azuren.app.install("0009", "Photos", iconImage, 4, 2, 1, function (app) {
        Azuren.file.fileList("image/*", function (e) {
            if (e.code == 0) {
                if (e.data.length > 0) {
                    var html = [];
                    app.tile.addClass("nocontextmenu");
                    for (x in e.data) {
                        html.push('<div style="background-image:url(/File/Detail?path=' + e.data[x] + '); background-size:cover;"></div>');
                    }
                    app.tile.html(html.join(""));

                    app.tile.liveTile({
                        mode: "carousel",
                        direction: "horizonal"
                    });
                    app.tile.append('<div class="tile-info">Photos</div>');
                }
            }
        });
    }, function (app) {
        Azuren.metroWindow("0009", "Photos", iconImage, "",function (win) {
            if (win.isNew) {
                Azuren.desktop.startLoading();
                $.get("/Photo/Index", {}, function (e) {
                    Azuren.desktop.stopLoading();
                    win.$content.html(e);
                    app.ready && app.ready();
                });
            }
        });
    });
    
})();