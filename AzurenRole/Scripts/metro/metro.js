(function () {
    var j = {
        getItem: function (a) {
            return !a || !this.hasItem(a) ? null : unescape(document.cookie.replace(RegExp("(?:^|.*;\\s*)" + escape(a).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"))
        }, setItem: function (a, c, d, e, h, f) {
            if (a && !/^(?:expires|max\-age|path|domain|secure)$/i.test(a)) {
                var g = "";
                if (d)
                    switch (d.constructor) {
                        case Number:
                            g = Infinity === d ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + d;
                            break;
                        case String:
                            g = "; expires=" + d;
                            break;
                        case Date:
                            g = "; expires=" + d.toGMTString()
                    }
                document.cookie =
                escape(a) + "=" + escape(c) + g + (h ? "; domain=" + h : "") + (e ? "; path=" + e : "") + (f ? "; secure" : "")
            }
        }, removeItem: function (a, c) {
            a && this.hasItem(a) && (document.cookie = escape(a) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (c ? "; path=" + c : ""))
        }, hasItem: function (a) {
            return RegExp("(?:^|;\\s*)" + escape(a).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(document.cookie)
        }
    }, a = {
        window_width: 0, window_height: 0, scroll_container_width: 0, widget_preview: null, widget_sidebar: null, widgets: null, widget_scroll_container: null, widget_containers: null,
        widget_open: !1, dragging_x: 0, left: 60, widget_page_data: [], is_touch_device: !1, title_prefix: "MelonHTML5 - ", init: function () {
            a.is_touch_device = "ontouchstart" in document.documentElement ? !0 : !1;
            a.cacheElements();
            a.Events.onWindowResize();
            $(window).bind("resize", a.Events.onWindowResize).bind("hashchange", a.Events.onHashChange);
            $(document).click(a.Events.onClick);
            a.widget_sidebar.children("div").children("div").click(a.Events.sidebarClick);
            a.is_touch_device ? $(document.body).addClass("touch") : $(document).mousedown(a.Events.onMouseDown).mouseup(a.Events.onMouseUp).mousemove(a.Events.onMouseMove);
            if ("" !== window.location.hash) {
                var b = window.location.hash.replace(/[#!\/]/g, ""), b = a.widgets.filter('[data-name="' + b + '"]');
                b.length && a.openWidget(b)
            }
            $(document.body).addClass("loaded");
            a.widgets.each(function (a) {
                var b = $(this);
                setTimeout(function () {
                    b.removeClass("unloaded");
                    setTimeout(function () {
                        b.removeClass("animation")
                    }, 300)
                }, 100 * a)
            })
        }, Events: {
            onWindowResize: function () {
                a.window_width = $(window).width();
                a.window_height = $(window).height()
            }, onHashChange: function (b) {
                var c = window.location.hash, d = c.replace(/[#!\/]/g,
                ""), e = function () {
                    var b = $('div.widget[data-name="' + d + '"]');
                    b.length && a.openWidget(b)
                };
                a.widget_open ? "" === c ? a.closeWidget(b) : a.widget_open.data("name") !== d && e() : "" !== c && e()
            }, onMouseDown: function (b) {
                a.widget_open || (a.dragging_x = b.clientX)
            }, onMouseUp: function () {
                if (!a.widget_open && a.dragging_x) {
                    $(document).scrollLeft(0);
                    a.dragging_x = 0;
                    var b = -1 * (a.scroll_container_width - a.window_width), c = function () {
                        setTimeout(function () {
                            a.widget_scroll_container.css("transition", "")
                        }, 400)
                    };
                    60 < a.left || a.scroll_container_width +
                    60 < a.window_width ? (a.widget_scroll_container.css("transition", "left 0.2s ease-in"), a.widget_scroll_container.css("left", 60), a.left = 60, c()) : a.left < b && (a.widget_scroll_container.css("transition", "left 0.2s ease-in"), a.widget_scroll_container.css("left", b), a.left = b, c())
                }
            }, onMouseMove: function (b) {
                if (!a.widget_open && a.dragging_x) {
                    var c = a.left + b.clientX - a.dragging_x;
                    a.widget_scroll_container.css("left", c);
                    a.dragging_x = b.clientX;
                    a.left = c
                }
            }, onClick: function (b) {
                b = $(b.target);
                b.hasClass("widget") ? a.openWidget(b) :
                b.parents("div.widget").length && a.openWidget(b.parents("div.widget"))
            }, sidebarClick: function (b) {
                switch ($(b.target).attr("class")) {
                    case "cancel":
                        a.closeWidget(b);
                        break;
                    case "refresh":
                        a.refreshWidget(b);
                        break;
                    case "download":
                        window.open("http://codecanyon.net/user/leli2000", "_blank");
                        break;
                    case "back":
                        a.previousWidget(b);
                        break;
                    case "next":
                        a.nextWidget(b)
                }
            }
        }, cacheElements: function () {
            a.widgets = $("div.widget");
            a.widget_containers = $("div.widget_container");
            a.widget_scroll_container = $("#widget_scroll_container");
            a.widget_preview = $("#widget_preview");
            a.widget_sidebar = $("#widget_sidebar");
            a.scroll_container_width = a.widget_scroll_container.width()
        }, openWidget: function (b) {
            var c = b.data("name"), d = b.data("link");
            d && "" !== d ? window.open(d, "_blank") : $.trim(b.data("url")).length && (a.widget_open = b, window.location.hash = "#!/" + c, document.title = a.title_prefix + c, $("#widget_preview_content").remove(), a.widget_preview.addClass("open").css("background-color", b.css("background-color")).css("background-image", b.find(".main").css("background-image")),
            a.widget_scroll_container.hide(), a._loadWidget(b));
            "undefined" !== typeof _gaq && _gaq.push(["_trackPageview", "#" + c])
        }, closeWidget: function () {
            window.location.hash = "";
            document.title = a.title_prefix + "Metro Framework";
            a.widget_scroll_container.show();
            a.widget_preview.removeClass("open");
            a.widget_open = !1;
            setTimeout(function () {
                $("#widget_preview_content").remove()
            }, 300)
        }, refreshWidget: function () {
            a._loadWidget(a.widget_open, !1)
        }, previousWidget: function (b) {
            var c = a.widget_open.prev();
            c.length || (c = a.widget_open.parent().children("div.widget").last());
            var d = c.data("url");
            d && "" !== d ? a.openWidget(c) : (a.widget_open = c, a.previousWidget(b))
        }, nextWidget: function (b) {
            var c = a.widget_open.next();
            c.length || (c = a.widget_open.parent().children("div.widget").first());
            var d = c.data("url");
            d && "" !== d ? a.openWidget(c) : (a.widget_open = c, a.nextWidget(b))
        }, _loadWidget: function (b, c) {
            var d = b.data("name"), e = function (b) {
                a.widget_preview.css("background-image", "none");
                var c = $("#widget_preview_content");
                c.length ? c.html(b) : c = $("<div>").attr("id", "widget_preview_content").insertAfter(a.widget_sidebar).html(b);
                "true" !== j.getItem("melonhtml5_metro_ui_sidebar_first_time") && (a.widget_sidebar.addClass("open"), a.widget_sidebar.mouseenter(function () {
                    j.setItem("melonhtml5_metro_ui_sidebar_first_time", "true", Infinity);
                    $(this).removeClass("open")
                }))
            }, h = (new Date).getTime();
            a.widget_preview.children("div.dot").remove();
            for (var f = 1; 7 >= f; f++)
                $("<div>").addClass("dot").css("transition", "right " + (0.6 + f / 10).toFixed(1) + "s ease-out").prependTo(a.widget_preview);
            var g = function () {
                var a = $("div.dot");
                a.length && (a.toggleClass("open"),
                setTimeout(g, 1300))
            }, k = function (b) {
                var c = (new Date).getTime() - h;
                1300 < c ? (a.widget_preview.children("div.dot").remove(), "undefined" !== typeof b && b()) : setTimeout(function () {
                    a.widget_preview.children("div.dot").remove();
                    "undefined" !== typeof b && b()
                }, 1300 - c)
            };
            a.widget_preview.width();
            g();
            "undefined" === typeof c && (c = !0);
            c && void 0 !== a.widget_page_data[d] ? k(function () {
                e(a.widget_page_data[d])
            }) : (f = $.trim(b.data("url")), 0 < f.length && $.ajax({
                url: f, cache: !1, type: "POST", data: {}, beforeSend: function () {
                }, complete: function () {
                },
                error: function () {
                }, success: function (b) {
                    k(function () {
                        a.widget_page_data[d] = b;
                        e(b)
                    })
                }
            }))
        }
    };
    $(document).ready(a.init)
})();

