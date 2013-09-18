$.ajaxSetup({ cache: false });
var ViewModel = function () {
    var self = this;
    this.nid = ko.observable(-1);
    this.title = ko.observable("");
    this.content = ko.observable("");
    this.list = ko.observableArray([]);
    this.clear = function () {
        this.nid(-1);
        this.content("");
        this.title("");
    };
    this.addNote = function () {
        if (self.title().trim().length == 0) {
            Azuren.alert.error("Title cannot be null");
            return;
        }
        $.post("/Note/AddOrMod", {
            title: self.title(),
            content: self.content(),
            id: self.nid()
        }, function (e) {
            if (e.code == 0) {
                if (e.data.Id != self.nid()) self.list.push({ Id: e.data.Id, Title: e.data.Title });
                self.nid(e.data.Id);
            }
        });
    };
    this.removeNote = function (note) {
        $.get("/Note/Delete?id=" + note.Id, {}, function (e) {
            if (e.code == 0) {
                if (note.Id == self.nid()) {
                    model.clear();
                }
                self.list.remove(note);
            }
        });
    };
    this.load = function (note) {
        if (note.Id != self.nid()) {
            $.get("/Note/Show?id=" + note.Id, {}, function (e) {
                if (e.code == 0) {
                    self.nid(e.data.Id);
                    self.title(e.data.Title);
                    self.content(e.data.Content);
                }
            });
        }
    };

};
var model = new ViewModel;
ko.applyBindings(model);
$(function () {
    $('textarea').autosize();
    $.get("/Note/List", {}, function (e) {
        model.list(e);
    });
});