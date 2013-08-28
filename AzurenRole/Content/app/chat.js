var Chat = {};
var getChatWindow = function (id) { return Azuren.WindowList.get_window("talk" + id); };
var firstRun = true;
var win;
Chat.userInfoList = [];
Chat.chatHub = $.connection.chatHub;
var userWrapper = function (userId) {
    if (Chat.userInfoList[userId] != undefined) {
        return '<span class="user-id ' + (userId == Chat.myId ? "my-id" : "") + '" data-id="' + userId + '">' + Chat.userInfoList[userId].displayname + '</span>';
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
    if (list.find('[data-id=' + user.id + "]").length == 0) {
        Chat.userInfoList[user.id] = user;
        var li = $("<li />").addClass("chat-box-user-item").attr("data-id", user.id).html(userWrapper(user.id));
        list.append(li);
    }
};

Chat.chatHub.client.updateUserInfo = function (data) {
    for (x in data) {
        Chat.userInfoList[data[x].id] = data[x];
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
    getChatWindow(groupId).$content.find(".chat-box-user-list [data-id=" + user.id + "]").remove();
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


Azuren.app.install("0001", "IM", "/Images/icons/metro/im.png", function (e) {
    e.preventDefault();

    Azuren.showWindow(280, 600, "0001", "Chat", "", function (w) {
        win = w;
        
    if (win.isNew) {
        win.$content.html('<img src="/Images/loading.gif" style="width: 220px;height:20px; margin:60% auto 0 auto";display:block; />');
        $.get("/Chat/Index", {}, function (e) {
            win.$content.html(e);
            Chat.myId = $("#logged-id").val();
        });

        win.$content.on("click", ".chat-info-setting", function (e) {
            $.get("/Account/Settings", {}, function (e) {
                var set_win = Azuren.showWindow(600, 690, "chat-setting", "Settings", e);
                if (set_win.isNew) {
                    
                    var fun = function (e) {
                        set_win.$content.html(e);
                        if (set_win.$content.find(".error-msg").length == 0) {
                            
                            var myName = set_win.$content.find(".displayname").val();
                            
                            Chat.userInfoList[Chat.myId] && (Chat.userInfoList[Chat.myId].displayname = myName);
                            $(".my-id").html(myName);
                            win.$content.find(".username").html(myName);
                            set_win.close();
                        } else {
                            set_win.$content.find("form").ajaxForm(fun);
                        }
                    };
                    set_win.$content.find("form").ajaxForm(fun);
                }
            });

        });
        win.$content.on("click", ".room-list-name a", function (data) {
            data.preventDefault();
            var id = $(this).data("id");
            $.get("/Chat/Chat?name=" + id, {}, function (e) {
                var talk = Azuren.showWindow(600, 480, "talk" + id, id, e);
                if (talk.isNew) {
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
