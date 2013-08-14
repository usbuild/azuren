window.Azuren = window.Azuren || {};
(function (azuren) {
    var messageMapping = {
        "event": function (e) {
            azuren.trigger(e.name, e.data);
        }
    };
    var eventList = {};
    azuren.isIE = navigator.userAgent.indexOf("MSIE") > -1 ? true: false;
    azuren.bind = function (name, callback) {
        if (!eventList[name]) {
            eventList[name] = [];
        }
        eventList[name].push(callback);
    };
    azuren.trigger = function(name, data) {
        if (eventList[name]) {
            for (var i in eventList[name]) {
                eventList[name][i](data);
            }
        }
    };
    var eventCurry = function(name) {
        return function(callback) {
            azuren.bind(name, callback);
        };
    };
    azuren.ready = eventCurry("ready");

    azuren.invoke = function (method, data) {
        window.parent.postMessage({method:method, data:data}, "*");
    };

    window.addEventListener("message", function (e) {
        messageMapping[e.data.type] && messageMapping[e.data.type](e.data.data);
    }, false);
})(Azuren);