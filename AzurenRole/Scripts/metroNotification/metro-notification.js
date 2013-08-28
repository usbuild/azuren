$(document).ready(function () {
    $("body").append("<div id='divSmallBoxes'></div>");
    $("body").append("<div id='divMiniIcons'></div><div id='divbigBoxes'></div>");
    $(".OpenSideBar").pageslide({ direction: "left" })
});
function MetroUnLoading() {
    $(".LoadingBoxContainer").addClass("animated fadeOut fast");
    MetroMSGboxCount = MetroMSGboxCount - 1;
    if (MetroMSGboxCount == 0) {
        $("#MsgBoxBack").removeClass("fadeIn").addClass("fadeOut").delay(300).queue(function () {
            ExistMsg = 0;
            $(this).remove()
        })
    }
    Point = 1;
    MetroLoadingTimer = 0;
    PointText = ""
}
var ExistMsg = 0;
var MetroMSGboxCount = 0;
var PrevTop = 0;
(function (b) {
    b.MetroMessageBox = function (v, a) {
        var s, u;
        v = b.extend({ title: "", content: "", NormalButton: undefined, ActiveButton: undefined, buttons: undefined, input: undefined, placeholder: "", options: undefined }, v);
        var n = 0;
        n = 1;
        if (isIE8orlower() == 0) {
            var i = document.createElement("audio");
            i.setAttribute("src", "static/sound/messagebox.mp3");
            b.get();
            i.addEventListener("load", function () {
                i.play()
            }, true);
            i.pause();
            i.play()
        }
        MetroMSGboxCount = MetroMSGboxCount + 1;
        if (ExistMsg == 0) {
            ExistMsg = 1;
            s = "<div class='divMessageBox animated fadeIn fast' id='MsgBoxBack'></div>";
            b("body").append(s);
            if (isIE8orlower() == 1) {
                b("#MsgBoxBack").addClass("MessageIE")
            }
        }
        var t = "";
        var o = 0;
        if (v.input != undefined) {
            o = 1;
            v.input = v.input.toLowerCase();
            switch (v.input) {
                case "text":
                    t = "<input type='" + v.input + "' id='txt" + MetroMSGboxCount + "' placeholder='" + v.placeholder + "' value='"+v.value+"'/><br/><br/>";
                    break;
                case "password":
                    t = "<input type='" + v.input + "' id='txt" + MetroMSGboxCount + "' placeholder='" + v.placeholder + "' value='" + v.value + "'/><br/><br/>";
                    break;
                case "select":
                    if (v.options == undefined) {
                        alert("For this type of input, the options parameter is required.")
                    } else {
                        t = "<select id='txt" + MetroMSGboxCount + "'>";
                        for (var p = 0; p <= v.options.length - 1; p++) {
                            if (v.options[p] == "[") {
                                q = ""
                            } else {
                                if (v.options[p] == "]") {
                                    r = r + 1;
                                    q = "<option>" + q + "</option>";
                                    t += q
                                } else {
                                    q += v.options[p]
                                }
                            }
                        }
                        t += "</select>"
                    }
                    break;
                default:
                    alert("That type of input is not handled yet")
            }
        }
        u = "<div class='MessageBoxContainer animated fadeIn fast' id='Msg" + MetroMSGboxCount + "'>";
        u += "<div class='MessageBoxMiddle'>";
        u += "<span class='MsgTitle'>" + v.title + "</span class='MsgTitle'>";
        u += "<p class='pText'>" + v.content + "</p>";
        u += t;
        u += "<div class='MessageBoxButtonSection'>";
        if (v.buttons == undefined) {
            v.buttons = "[Accept]"
        }
        v.buttons = b.trim(v.buttons);
        v.buttons = v.buttons.split("");
        var q = "";
        var r = 0;
        if (v.NormalButton == undefined) {
            v.NormalButton = "#232323"
        }
        if (v.ActiveButton == undefined) {
            v.ActiveButton = "#ed145b"
        }
        for (var p = 0; p <= v.buttons.length - 1; p++) {
            if (v.buttons[p] == "[") {
                q = ""
            } else {
                if (v.buttons[p] == "]") {
                    r = r + 1;
                    q = "<button id='bot" + r + "-Msg" + MetroMSGboxCount + "' class='botTempo' style='background-color: " + v.NormalButton + ";'> " + q + "</button>";
                    u += q
                } else {
                    q += v.buttons[p]
                }
            }
        }
        u += "</div>";
        u += "</div>";
        u += "</div>";
        if (MetroMSGboxCount > 1) {
            b(".MessageBoxContainer").hide();
            b(".MessageBoxContainer").css("z-index", 99999)
        }
        b(".divMessageBox").append(u);
        if (o == 1) {
            b("#txt" + MetroMSGboxCount).focus()
        }
        b(".botTempo").hover(function () {
            var c = b(this).attr("id");
            b("#" + c).css("background-color", v.ActiveButton)
        }, function () {
            var c = b(this).attr("id");
            b("#" + c).css("background-color", v.NormalButton)
        });
        b(".botTempo").click(function () {
            var d = b(this).attr("id");
            var e = d.substr(d.indexOf("-") + 1);
            var g = b.trim(b(this).text());
            if (o == 1) {
                if (typeof a == "function") {
                    var f = e.replace("Msg", "");
                    var c = b("#txt" + f).val();
                    if (a) {
                        a(g, c)
                    }
                }
            } else {
                if (typeof a == "function") {
                    if (a) {
                        a(g)
                    }
                }
            }
            b("#" + e).addClass("animated fadeOut fast");
            MetroMSGboxCount = MetroMSGboxCount - 1;
            if (MetroMSGboxCount == 0) {
                b("#MsgBoxBack").removeClass("fadeIn").addClass("fadeOut").delay(300).queue(function () {
                    ExistMsg = 0;
                    b(this).remove()
                })
            }
        })
    }
})(jQuery);
var Point = 1;
var MetroLoadingTimer = 0;
var PointText = "";
var MetroExist = false;
(function (b) {
    b.MetroLoading = function (i, h) {
        var k;
        i = b.extend({ title: undefined, content: undefined, img: undefined, timeout: undefined, special: undefined }, i);
        MetroMSGboxCount = MetroMSGboxCount + 1;
        if (ExistMsg == 0) {
            ExistMsg = 1;
            k = "<div class='divMessageBox animated fadeIn fast' id='MsgBoxBack'></div>";
            b("body").append(k);
            if (isIE8orlower() == 1) {
                b("#MsgBoxBack").addClass("MessageIE")
            }
        }
        if (i.title == undefined) {
            i.title = "Loading"
        }
        if (i.content == undefined) {
            i.content = "Please wait."
        }
        var l = "";
        if (i.img == undefined) {
            i.img = "";
            l = "<br/><br/><br/><br/><br/>"
        } else {
            i.img = "<img src='" + i.img + "' class='animated fadeIn'/>"
        }
        var j = "";
        j += "<div class='LoadingBoxContainer'>";
        j += "<div class='LoadingBoxMiddle'>";
        j += "<div align='center'>";
        j += "<br/><br/>";
        j += i.img;
        j += "<br/><br/><br/>";
        if (i.special == true) {
            j += "<span class='MsgTitle animated fadeIn' id='lblSpecialTitle'>" + i.title + "</span>"
        } else {
            j += "<br/><span class='MsgTitle animated fadeIn'>" + i.title + "<span id='LoadingPoints'>.</span></span>";
            j += "<p class='pText animated fadeIn'>" + i.content + "</p>"
        }
        j += l;
        j += "</div>";
        j += "</div>";
        j += "</div>";
        b(".divMessageBox").append(j);
        if (i.timeout == undefined) {
            i.timeout = 3000
        }
        var a = setInterval(function () {
            if (b(".LoadingBoxContainer").length > 0) {
            } else {
                window.clearInterval(a)
            }
            if (i.special == true) {
                if (MetroLoadingTimer == 2) {
                    b("#lblSpecialTitle").removeClass("fadeIn").addClass("fadeOut").delay(300).queue(function () {
                        b(this).text(i.content);
                        b(this).clearQueue();
                        b(this).removeClass("fadeOut");
                        b(this).addClass("fadeIn")
                    });
                    MetroLoadingTimer += 1
                } else {
                    if (MetroLoadingTimer == 5) {
                        b("#lblSpecialTitle").removeClass("fadeIn").addClass("fadeOut").delay(300).queue(function () {
                            b(this).text(i.title);
                            b(this).clearQueue();
                            b(this).removeClass("fadeOut");
                            b(this).addClass("fadeIn")
                        });
                        MetroLoadingTimer = 0
                    } else {
                        MetroLoadingTimer += 1
                    }
                }
            } else {
                if (Point == 0) {
                    PointText = ".";
                    Point += 1
                } else {
                    if (Point == 1) {
                        PointText = "..";
                        Point += 1
                    } else {
                        if (Point == 2) {
                            PointText = "...";
                            Point += 1
                        } else {
                            if (Point == 3) {
                                PointText = "....";
                                Point = 0
                            }
                        }
                    }
                }
                b("#LoadingPoints").text(PointText)
            }
        }, 750);
        setTimeout(function () {
            b(".LoadingBoxContainer").addClass("animated fadeOut fast");
            MetroMSGboxCount = MetroMSGboxCount - 1;
            window.clearInterval(a);
            if (MetroMSGboxCount == 0) {
                b("#MsgBoxBack").removeClass("fadeIn").addClass("fadeOut").delay(300).queue(function () {
                    ExistMsg = 0;
                    b(this).remove()
                })
            }
            if (typeof h == "function") {
                if (h) {
                    h()
                }
            }
        }, i.timeout)
    }
})(jQuery);
var BigBoxes = 0;
(function (b) {
    b.bigBox = function (a, h) {
        var k, l;
        a = b.extend({ title: "", content: "", img: undefined, number: undefined, color: undefined, timeout: undefined }, a);
        if (isIE8orlower() == 0) {
            var i = document.createElement("audio");
            i.setAttribute("src", "static/sound/bigbox.mp3");
            b.get();
            i.addEventListener("load", function () {
                i.play()
            }, true);
            i.pause();
            i.play()
        }
        BigBoxes = BigBoxes + 1;
        k = "<div id='bigBox" + BigBoxes + "' class='bigBox animated fadeIn fast'><div id='bigBoxColor" + BigBoxes + "'><img class='botClose' id='botClose" + BigBoxes + "' src='static/img/close.png'>";
        k += "<span>" + a.title + "</span>";
        k += "<p>" + a.content + "</p>";
        k += "<div class='bigboxicon'>";
        if (a.img == undefined) {
            a.img = "static/img/cloud.png"
        }
        k += "<img src='" + a.img + "'>";
        k += "</div>";
        k += "<div class='bigboxnumber'>";
        if (a.number != undefined) {
            k += a.number
        }
        k += "</div></div>";
        k += "</div>";
        b("#divbigBoxes").append(k);
        if (a.color == undefined) {
            a.color = "#004d60"
        }
        b("#bigBox" + BigBoxes).css("background-color", a.color);
        b("#divMiniIcons").append("<div id='miniIcon" + BigBoxes + "' class='cajita animated fadeIn' style='background-color: " + a.color + ";'><img src='" + a.img + "'/></div>");
        b("#miniIcon" + BigBoxes).bind("click", function () {
            var c = b(this).attr("id");
            var d = c.replace("miniIcon", "bigBox");
            var e = c.replace("miniIcon", "bigBoxColor");
            b(".cajita").each(function (g) {
                var n = b(this).attr("id");
                var f = n.replace("miniIcon", "bigBox");
                b("#" + f).css("z-index", 9998)
            });
            b("#" + d).css("z-index", 9999);
            b("#" + e).removeClass("animated fadeIn").delay(1).queue(function () {
                b(this).show();
                b(this).addClass("animated fadeIn");
                b(this).clearQueue()
            })
        });
        b("#botClose" + BigBoxes).bind("click", function () {
            if (typeof h == "function") {
                if (h) {
                    h()
                }
            }
            var d = b(this).attr("id");
            var e = d.replace("botClose", "bigBox");
            var c = d.replace("botClose", "miniIcon");
            b("#" + e).removeClass("fadeIn fast");
            b("#" + e).addClass("fadeOut fast").delay(300).queue(function () {
                b(this).clearQueue();
                b(this).remove()
            });
            b("#" + c).removeClass("fadeIn fast");
            b("#" + c).addClass("fadeOut fast").delay(300).queue(function () {
                b(this).clearQueue();
                b(this).remove()
            })
        });
        if (a.timeout != undefined) {
            var j = BigBoxes;
            setTimeout(function () {
                b("#bigBox" + j).removeClass("fadeIn fast");
                b("#bigBox" + j).addClass("fadeOut fast").delay(300).queue(function () {
                    b(this).clearQueue();
                    b(this).remove()
                });
                b("#miniIcon" + j).removeClass("fadeIn fast");
                b("#miniIcon" + j).addClass("fadeOut fast").delay(300).queue(function () {
                    b(this).clearQueue();
                    b(this).remove()
                })
            }, a.timeout)
        }
    }
})(jQuery);
var SmallBoxes = 0;
var SmallCount = 0;
var SmallBoxesAnchos = 0;
(function (b) {
    b.smallBox = function (o, j) {
        var m, n;
        o = b.extend({ title: "", content: "", img: undefined, icon: undefined, color: undefined, timeout: undefined }, o);
        if (isIE8orlower() == 0) {
            var k = document.createElement("audio");
            k.setAttribute("src", "static/sound/smallbox.mp3");
            b.get();
            k.addEventListener("load", function () {
                k.play()
            }, true);
            k.pause();
            k.play()
        }
        SmallBoxes = SmallBoxes + 1;
        m = "";
        var p = "";
        var a = "smallbox" + SmallBoxes;
        if (o.icon == undefined) {
            p = "<div class='miniIcono'></div>"
        } else {
            p = "<div class='miniIcono'><img class='miniPic' src='" + o.icon + "'></div>"
        }
        if (o.img == undefined) {
            m = "<div id='smallbox" + SmallBoxes + "' class='SmallBox animated fadeInRight fast'><div class='textoFull'><span>" + o.title + "</span><p>" + o.content + "</p></div>" + p + "</div>"
        } else {
            m = "<div id='smallbox" + SmallBoxes + "' class='SmallBox animated fadeInRight fast'><div class='foto'><img src='" + o.img + "'></div><div class='textoFoto'><span>" + o.title + "</span><p>" + o.content + "</p></div>" + p + "</div>"
        }
        if (SmallBoxes == 1) {
            b("#divSmallBoxes").append(m);
            SmallBoxesAnchos = b("#smallbox" + SmallBoxes).height() + 40
        } else {
            var l = b(".SmallBox").size();
            if (l == 0) {
                b("#divSmallBoxes").append(m);
                SmallBoxesAnchos = b("#smallbox" + SmallBoxes).height() + 40
            } else {
                b("#divSmallBoxes").append(m);
                b("#smallbox" + SmallBoxes).css("top", SmallBoxesAnchos);
                SmallBoxesAnchos = SmallBoxesAnchos + b("#smallbox" + SmallBoxes).height() + 20;
                b(".SmallBox").each(function (c) {
                    if (c == 0) {
                        b(this).css("top", 20);
                        heightPrev = b(this).height() + 40;
                        SmallBoxesAnchos = b(this).height() + 40
                    } else {
                        b(this).css("top", heightPrev);
                        heightPrev = heightPrev + b(this).height() + 20;
                        SmallBoxesAnchos = SmallBoxesAnchos + b(this).height() + 20
                    }
                })
            }
        }
        if (o.color == undefined) {
            b("#smallbox" + SmallBoxes).css("background-color", "#004d60")
        } else {
            b("#smallbox" + SmallBoxes).css("background-color", o.color)
        }
        if (o.timeout != undefined) {
            setTimeout(function () {
                var d = b(this).height() + 20;
                var f = a;
                var c = b("#" + a).css("top");
                SmallBoxesAnchos = SmallBoxesAnchos - d;
                b("#" + a).remove();
                var g = 1;
                var e = 0;
                b(".SmallBox").each(function (h) {
                    if (h == 0) {
                        b(this).css("top", 20);
                        e = b(this).height() + 40;
                        SmallBoxesAnchos = b(this).height() + 40
                    } else {
                        b(this).css("top", e);
                        e = e + b(this).height() + 20;
                        SmallBoxesAnchos = SmallBoxesAnchos + b(this).height() + 20
                    }
                })
            }, o.timeout)
        }
        b("#smallbox" + SmallBoxes).bind("click", function () {
            if (typeof j == "function") {
                if (j) {
                    j()
                }
            }
            var d = b(this).height() + 20;
            var f = b(this).attr("id");
            var c = b(this).css("top");
            SmallBoxesAnchos = SmallBoxesAnchos - d;
            b(this).remove();
            var g = 1;
            var e = 0;
            b(".SmallBox").each(function (h) {
                if (h == 0) {
                    b(this).css("top", 20);
                    e = b(this).height() + 40;
                    SmallBoxesAnchos = b(this).height() + 40
                } else {
                    b(this).css("top", e);
                    e = e + b(this).height() + 20;
                    SmallBoxesAnchos = SmallBoxesAnchos + b(this).height() + 20
                }
            })
        })
    }
})(jQuery);
function Hola() {
    alert("Hola Mundo")
}
function CloseSide() {
    $.pageslide.close()
}
(function (l) {
    var m, j;
    l(function () {
        m = l("body"), j = l("#pageslide");
        if (j.length == 0) {
            j = l("<div />").attr("id", "pageslide").css("display", "none").appendTo(l("body"))
        }
        j.click(function (a) {
            a.stopPropagation()
        });
        l(document).bind("click keyup", function (a) {
            if (a.type == "keyup" && a.keyCode != 27) {
                return
            }
            if (j.is(":visible") && !j.data("modal")) {
                l.pageslide.close()
            }
        })
    });
    var i = false, k;
    function n(b, c) {
        if (b.indexOf("#") === 0) {
            l(b).clone(true).appendTo(j.empty()).show()
        } else {
            if (c) {
                var a = l("<iframe />").attr({ src: b, frameborder: 0, hspace: 0 }).css({ width: "100%", height: "100%" });
                j.html(a)
            } else {
                j.load(b)
            }
            j.data("localEl", false)
        }
    }
    function h(c, d) {
        var a = j.outerWidth(true), b = {}, e = {};
        if (j.is(":visible") || i) {
            return
        }
        i = true;
        switch (c) {
            case "left":
                j.css({ left: "auto", right: "-" + a + "px" });
                b["margin-left"] = "-=" + a;
                e.right = "+=" + a;
                break;
            default:
                j.css({ left: "-" + a + "px", right: "auto" });
                b["margin-left"] = "+=" + a;
                e.left = "+=" + a;
                break
        }
        m.animate(b, d);
        j.show().animate(e, d, function () {
            i = false
        })
    }
    l.fn.pageslide = function (b) {
        var a = this;
        a.click(function (d) {
            var c = l(this), e = l.extend({ href: c.attr("href") }, b);
            d.preventDefault();
            d.stopPropagation();
            if (j.is(":visible") && c[0] == k) {
                l.pageslide.close()
            } else {
                l.pageslide(e);
                k = c[0]
            }
        })
    };
    l.fn.pageslide.defaults = { speed: 200, direction: "right", modal: false, iframe: true, href: null };
    l.pageslide = function (b) {
        var a = l.extend({}, l.fn.pageslide.defaults, b);
        if (j.is(":visible") && j.data("direction") != a.direction) {
            l.pageslide.close(function () {
                n(a.href, a.iframe);
                h(a.direction, a.speed)
            })
        } else {
            n(a.href, a.iframe);
            if (j.is(":hidden")) {
                h(a.direction, a.speed)
            }
        }
        j.data(a)
    };
    l.pageslide.close = function (a) {
        var b = l("#pageslide"), c = b.outerWidth(true), e = b.data("speed"), d = {}, f = {};
        if (b.is(":hidden") || i) {
            return
        }
        i = true;
        switch (b.data("direction")) {
            case "left":
                d["margin-left"] = "+=" + c;
                f.right = "-=" + c;
                break;
            default:
                d["margin-left"] = "-=" + c;
                f.left = "-=" + c;
                break
        }
        b.animate(f, e);
        m.animate(d, e, function () {
            b.hide();
            i = false;
            if (typeof a != "undefined") {
                a()
            }
        })
    }
})(jQuery);
function getInternetExplorerVersion() {
    var f = -1;
    if (navigator.appName == "Microsoft Internet Explorer") {
        var e = navigator.userAgent;
        var d = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
        if (d.exec(e) != null) {
            f = parseFloat(RegExp.$1)
        }
    }
    return f
}
function checkVersion() {
    var c = "You're not using Windows Internet Explorer.";
    var d = getInternetExplorerVersion();
    if (d > -1) {
        if (d >= 8) {
            c = "You're using a recent copy of Windows Internet Explorer."
        } else {
            c = "You should upgrade your copy of Windows Internet Explorer."
        }
    }
    alert(c)
}
function isIE8orlower() {
    var c = "0";
    var d = getInternetExplorerVersion();
    if (d > -1) {
        if (d >= 9) {
            c = 0
        } else {
            c = 1
        }
    }
    return c
}
