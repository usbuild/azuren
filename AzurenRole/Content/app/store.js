(function () {


    var Store = {};
    var iconImage = "/Images/icons/metro/store.png";
    var setContent = function (layout, content) {
        layout.html(content);
        $('.metro-layout .items', layout).css({ width: $('.metro-layout .items', layout).outerWidth() }).isotope({ itemSelector: '.box', layoutMode: 'masonryHorizontal', animationEngine: 'css' });
        $('.metro-layout .content').dragscrollable({ dragSelector: '.items' });
    };

    Azuren.app.install("0002", "Store", iconImage, 1, 1, 1, function (app) {
        
        app.tile.html([
                        '<div><img class="full" src="', iconImage, '" width="110" height="110" style="margin-top: 10px"/></div>',
                        '<div class="tile-textview">App Store<br /> Your Apps Here!</div>'
        ].join(""));

        app.tile.addClass("red");
        app.tile.liveTile({
            mode: "carousel",
            direction: "horizonal"
        });
        
    }, function (app) {
        Azuren.metroWindow("0002", "Store", iconImage, "",function (win) {
            if (win.isNew) {

                var appbar1 = {
                    menu: [
                        { name: "search", title:"Search Apps"}
                    ],
                    autoHide: true
                };
                var appbar2 = {
                    menu: [
                        { name: "home"},
                        { name: "search"},
                        { name: "download"}
                    ],
                    autoHide: true
                };
                var appbar3 = {
                    menu: [
                        { name: "home"},
                        { name: "search"},
                        { name: "remove"}
                    ],
                    autoHide: true
                };
                Azuren.app.setAppBar("0002", appbar1);

                win.onAppBar = function (data) {
                    switch (data.name) {
                        case "home":
                            {
                                Azuren.desktop.startLoading();
                                $.get("/Store/Index", {}, function (e) {
                                    win.$content.css("background", "url(/Images/login-back.jpg) center no-repeat").css("background-size", "100% 100%");
                                    Azuren.desktop.stopLoading();
                                    setContent(win.$content, e);
                                    Azuren.app.setAppBar("0002", appbar1);
                                });
                            }
                            break;
                        case "search":
                            {
                                Azuren.alert.warn("Not implement yet.");
                            }
                            break;
                        case "download":
                            {
                                var id = $("#va-app-id").val();
                                Azuren.desktop.startLoading();
                                $.post("/Store/Install", { id: id }, function (e) {
                                    Azuren.desktop.stopLoading();
                                    if (e.code == 0) {
                                        Azuren.app.installEx(e.data.id, e.data.name, e.data.icon, e.data.url, e.data.width, e.data.height, e.data.iwidth, e.data.iheight, e.data.type, e.data.tile);
                                        Azuren.app.setAppBar("0002", appbar3);
                                        Azuren.alert.success("Install successfully");
                                    } else {
                                        Azuren.alert.error("Install failed");
                                    }
                                }, "json");
                            }
                            break;
                        case "remove":
                            {
                                
                                var id = $("#va-app-id").val();
                                Azuren.desktop.startLoading();
                                $.post("/Store/UnInstall", { id: id }, function (e) {
                                    Azuren.desktop.stopLoading();
                                    if (e.code == 0) {
                                        Azuren.app.uninstall(e.data.id);
                                        Azuren.app.setAppBar("0002", appbar2);
                                        Azuren.alert.success("uninstall successfully");
                                    } else {
                                        Azuren.alert.error("uninstall failed");
                                    }
                                }, "json");
                            } break;
                    }
                };

                win.$content.css("background", "url(/Images/login-back.jpg) center no-repeat").css("background-size", "100% 100%");
                Azuren.desktop.startLoading();
                $.get("/Store/Index", {}, function (e) {
                    Azuren.desktop.stopLoading();
                    setContent(win.$content, e);
                    app.ready && app.ready();
                    win.$content.on("click", ".store-app", function (e) {
                        Azuren.desktop.startLoading();
                        $.get("/Store/View?id=" + $(this).data("id"), {}, function (e) {
                            win.$content.css("background", "white");
                            Azuren.desktop.stopLoading();
                            setContent(win.$content, e);
                            
                            $('.screenshots', win.$content).bjqs({
                                animtype: 'slide',
                                height: 400,
                                width: 640,
                                responsive: true,
                                randomstart: true,
                                showmarkers:false
                            });

                            if ($("#installed").val() == 1) {
                                Azuren.app.setAppBar("0002", appbar3);
                            } else {
                                Azuren.app.setAppBar("0002", appbar2);
                            }

                        });
                    });

                    win.$content.on("submit", ".store-search-form", function (e) {
                        e.preventDefault();
                        alert("Not implement yet");
                    });
                });
            }
        });
    });
})();