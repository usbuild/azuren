var Chat = {};
var getChatWindow = function (id) { return Azuren.WindowList.get_window("talk" + id); };
var firstRun = true;
var win;
Chat.userInfoList = [];
Chat.chatHub = $.connection.chatHub;
var userWrapper = function (userId) {
    if (Chat.userInfoList[userId] != undefined) {
        return '<span class="user-id ' + (userId == Chat.myId ? "my-id" : "") + '" data-id="' + userId + '">' + Chat.userInfoList[userId].Username + '</span>';
    } else {
        return '<span class="raw-user-id ' + (userId == Chat.myId ? "my-id" : "") + '" data-id="' + userId + '">' + userId + '</span>';
    }
};

Chat.appendChat = function (roomId, obj) {
    var time = new Date(Date.parse(obj.Time));
    var w = getChatWindow(roomId);
    if (w) {
        var log = getChatWindow(roomId).$content.find(".chat-box-log").append(
            $("<div />").addClass("chat-item").append(
                ['<div class="chat-info">', userWrapper(obj['Author']),
                    '<span class="chat-time">(', time.getFullYear(), "-", time.getMonth() + 1, "-", time.getDate(), " ", time.getHours(), ":",
                    time.getMinutes(), ":", time.getSeconds(), ")</span>",
                    ':</div><div class="chat-content">', obj['Content'], "</div>"].join(""))
        );

        if (Azuren.WindowList.get_top().id != roomId) {
            log[0].scrollTop = log[0].scrollHeight;
        }
    }
};

Chat.chatHub.client.addNewMessageToPage = function (groupId, obj) {
    var o = getChatWindow(groupId);
    if (o) {
        if (!o.isActive()) {
            $(o.taskbarBtn).addClass("blink");
        }
        Chat.appendChat(groupId, obj);
    }
};


var addUserToList = function (roomId, user) {
    var list = getChatWindow(roomId).$content.find(".chat-box-user-list ul");
    if (list.find('[data-id=' + user.Id + "]").length == 0) {
        Chat.userInfoList[user.Id] = user;
        var li = $("<li />").addClass("chat-box-user-item").attr("data-id", user.Id).html(userWrapper(user.Id));
        list.append(li);
    }
};

Chat.chatHub.client.updateUserInfo = function (data) {
    for (x in data) {
        Chat.userInfoList[data[x].Id] = data[x];
    }

    $("span.raw-user-id").each(function () {
        var id = $(this).data("id");
        $(this).replaceWith(userWrapper(id));
    });
};


var refreshUserInfo = function () {
    var data = [];
    $("span.raw-user-id").each(function () {
        var id = $(this).data("id");
        if (Chat.userInfoList[id] == undefined && data.indexOf(id) == -1) {
            data.push(id);
        }
    });
    if (data.length > 0) {
        Chat.chatHub.server.getUserInfo(data);
    }
};

Chat.chatHub.client.loadRecent = function (groupId, data) {
    for (x in data) {
        Chat.appendChat(groupId, data[x]);
    }
    refreshUserInfo();
};


Chat.chatHub.client.updateGroupUsers = function (groupId, users) {
    for (x in users) {
        addUserToList(groupId, users[x]);
    }
};


Chat.chatHub.client.userOffline = function (groupId, user) {
    getChatWindow(groupId).$content.find(".chat-box-user-list [data-id=" + user.Id + "]").remove();
};

Chat.chatHub.client.userOnline = function (groupId, user) {
    addUserToList(groupId, user);
};

/*
$.connection.hub.start().done(function () {

});
*/

$(document).on("click", ".chat-box-post button", function (e, t) {
    var content = $(this).parents(".contentarea");
    Chat.chatHub.server.send(content.find(".chat-name").val(), t.getContent());
    t.setContent("");
});
$(document).on("click", ".chat-box-user-toggle", function (e) {
    $(this).next(".chat-box-user-list").toggle();
});


Azuren.app.install("0001", "IM", "/Images/icons/metro/im.png", 1, 1, 0, function () {
}, function (e) {
    e.preventDefault();

    Azuren.showWindow(280, 600, "0001", "Chat", "", function (w) {
        win = w;

        if (win.isNew) {
            win.$content.html('<img src="/Images/jar-loading.gif" style="margin-top: 40%" />');
            $.get("/Chat/Index", {}, function (e) {
                win.$content.html(e);
                Chat.myId = $("#logged-id").val();
            });

            win.$content.on("click", ".room-list-name a", function (data) {
                data.preventDefault();
                var id = $(this).data("id");
                $.get("/Chat/Chat?name=" + id, {}, function (e) {
                    Azuren.showWindow(600, 480, "talk" + id, id, e, function (talk) {
                        if (talk.isNew) {
                            talk.setTaskbarBtn("/Images/icons/message.png");
                            Chat.chatHub.server.addGroup(id);
                            talk.unnotify = function () {
                                $("#tskbrbtn_" + talk.id).removeClass("blink");
                            };
                            talk.onClose = function () {
                                Chat.chatHub.server.removeGroup(id);
                            };
                            Chat.chatHub.server.getRecent(id);
                        }
                    });
                });
                return false;
            });

            win.$content.on("click", ".group-remove", function (e) {
                e.preventDefault();
                var id = $(this).data("id");
                var cwin = getChatWindow(id);
                cwin && cwin.close();
                $.get("/Chat/RemoveGroup", { name: id }, function (e) {
                    if (e.code == 0) {
                        $.get("/Chat/Index", {}, function (e) {
                            win.$content.html(e);
                        });
                    }
                });

                return false;
            });
            win.$content.on("click", ".add-new-room-btn", function (e) {
                e.preventDefault();
                var name = $(this).prev(".add-new-room-text").val().trim();
                if (/[^\w-_]/.test(name)) {
                    alert("Only allow letters and number");
                    return;
                }
                if (name.length < 4) {
                    alert("Length should >= 4");
                    return;
                }

                $.getJSON("/Chat/AddGroup", { name: name }, function (e) {

                    if (e.code == 0) {
                        $.get("/Chat/Index", {}, function (e) {
                            win.$content.html(e);
                        });
                    }
                });
                return false;
            });
        }
    });

    return false;
});
