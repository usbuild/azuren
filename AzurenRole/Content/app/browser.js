Azuren.browser.open = function (url) {
    if (win == null) {
        Azuren.app.start("0006");
    }

    function waitFor() {
        if ($(".browser-go").length > 0) {
            $(".browser-addr-input").val(url);
            $(".browser-go").trigger("click");
        } else {
            setTimeout(waitFor, 200);
        }
    }

    waitFor();

};
var win = null;
Azuren.app.install("0006", "Browser", "/Images/icons/metro/browser.png", function (e) {
    win = Azuren.showWindow(600, 480, "0006", "Browser", "", function (win) {
        if (win.isNew) {
            $.get("/Browser/Index", {}, function (e) {
                win.$content.html(e);
                explore(index);
            });
            var index = "http://bing.com";
            $(document).on("click", ".browser-go", function () {
                var url = $(".browser-addr-input").val().trim();
                if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0) {

                } else {
                    url = "http://" + url;
                }
                $(".browser-addr-input").val(url);
                $('#browser-' + tablist.current + ' .browser-frame').attr("src", url);
                var cur = tablist[tablist.current];
                var history = cur.history;
                cur.position++;
                cur.history = history.slice(0, cur.position);
                cur.history.push(url);
            });
            $(document).on("keypress", ".browser-addr-input", function (e) {
                if (e.keyCode == 13) {
                    $(".browser-go").trigger("click");
                }
            });
            var i = 0;
            var tablist = {};
            tablist.current = 0;
            tablist[0] = { history: [], position: -1 };

            var explore = function (e) {
                $(".browser-addr-input").val(e);
                $(".browser-go").trigger("click");
            };

            $(document).on("click", ".browser-add-tab", function (e) {
                i++;
                $(".browser-tabs").append('<li><a href="#browser-' + i + '" data-id="' + i + '">#' + i + '</a></li>');
                $(".browser-main").append([
                    '<div class="tab-pane active" id="browser-' + i + '">',
                    '<iframe class="browser-frame" scrolling="auto"></iframe>',
                    '</div>'
                ].join(""));
                tablist[i] = { history: [], position: -1 };
                tablist.current = i;
                $("a[href=#browser-" + i + "]").trigger("click");
                explore(index);
            });

            $(document).on("click", ".browser-tabs a", function (e) {
                $(this).tab("show");
                tablist.current = $(this).data("id");
                console.dir(tablist.current);
                var history = tablist[tablist.current].history;
                $(".browser-addr-input").val(history[history.length - 1]);
            });

            $(document).on("click", ".browser-back", function (e) {
                var cur = tablist[tablist.current];
                if (cur.position == 0) {
                    Azuren.alert.warn("Can not go back!", 1000);
                    return;
                }
                cur.position--;
                var url = cur.history[cur.position];
                $(".browser-addr-input").val(url);
                $('#browser-' + tablist.current + ' .browser-frame').attr("src", url);
            });

            $(document).on("click", ".browser-forward", function (e) {
                var cur = tablist[tablist.current];
                if (cur.position == cur.history.length - 1) {
                    Azuren.alert.warn("Can not forward!", 1000);
                    return;
                }
                cur.position++;
                var url = cur.history[cur.position];
                $(".browser-addr-input").val(url);
                $('#browser-' + tablist.current + ' .browser-frame').attr("src", url);
            });

            $(document).on("click", ".browser-refresh", function (e) {
                var history = tablist[tablist.current].history;
                $('#browser-' + tablist.current + ' .browser-frame').attr("src", history[history.length - 1]);
            });

            $(document).on("click", ".browser-home", function (e) {
                explore(index);
            });

            $(document).on("click", ".browser-star", function (e) {
                Azuren.alert.warn("function not implment yet");
            });
        }
    });
});