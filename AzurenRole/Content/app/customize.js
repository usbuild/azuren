Azuren.desktop.customizeDialog = function () {
    Azuren.showWindow(400, 320, "0010", "Customize", "", function (win) {
        if (win.isNew) {
            win.setTaskbarBtn("/Images/icons/customize.png");
            $.get("/Home/Customize", {}, function(e) {
                win.$content.html(e);
            });
            win.$content.on("change", "[name=themeRadios]", function(e) {
                var val = $("[name=themeRadios]:checked").val();
                $.get("/Customize/SetTheme?id=" + val, {}, function (e) {
                    if (e.code == 0) {
                        Azuren.desktop.setTheme(e.data.Theme.Url);
                    }
                });
            });
        }
    });
};