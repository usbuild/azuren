window.Azuren = window.Azuren || {};
(function (azuren) {
    var messageMapping = {
        "event": function (e) {
            azuren.trigger(e.name, e.data);
        }
    };
    var eventList = {};
    azuren.isIE = navigator.userAgent.indexOf("MSIE") > -1 ? true : false;
    azuren.bind = function (name, callback) {
        if (!eventList[name]) {
            eventList[name] = [];
        }
        eventList[name].push(callback);
    };
    azuren.trigger = function (name, data) {
        if (eventList[name]) {
            for (var i in eventList[name]) {
                eventList[name][i](data);
            }
        }
    };
    var eventCurry = function (name) {
        return function (callback) {
            azuren.bind(name, callback);
        };
    };

    var callbackWrapper = function (callback) {
        var varName = "AzurenCallback" + new Date().getTime();
        messageMapping[varName] = function (e) {
            delete messageMapping[varName];
            callback(e);
        };
        return varName;
    };

    azuren.desktop = {};
    azuren.system = {};

    azuren.ready = eventCurry("ready");

    azuren.invoke = function (method, data, callback) {
        callback ?
            window.parent.postMessage({ method: method, data: data, 'callback': callbackWrapper(callback) }, "*") :
            window.parent.postMessage({ method: method, data: data }, "*");
    };
    azuren.isInsite = function () {
        return !(window.parent == window);
    };

    window.addEventListener("message", function (e) {
        messageMapping[e.data.type] && messageMapping[e.data.type](e.data.data);
    }, false);

    azuren.postMessage = function (content, callback) {
        azuren.invoke("postMessage", {}, callback);
    };

    azuren.notify = function (title, text) {
        azuren.invoke("notify", { title: title, text: text });
    };

    azuren.alert = {};
    azuren.alert.success = function (content, time, callback) {
        azuren.invoke("alert.success", { content: content, time: time }, callback);
    };
    azuren.alert.info = function (content, time, callback) {
        azuren.invoke("alert.info", { content: content, time: time }, callback);
    };
    azuren.alert.warn = function (content, time, callback) {
        azuren.invoke("alert.warn", { content: content, time: time }, callback);
    };
    azuren.alert.error = function (content, time, callback) {
        azuren.invoke("alert.error", { content: content, time: time }, callback);
    };

    azuren.system.logout = function () {
        azuren.invoke("system.logout", {});
    };

    azuren.app = {};
    azuren.app.setWidth = function (size) {
        azuren.invoke("app.setWidth", { size: size });
    };
    azuren.app.setHeight = function (size) {
        azuren.invoke("app.setHeight", { size: size });
    };

    azuren.desktop.setBackground = function (url) {
        azuren.invoke("desktop.setBackground", { url: url });
    };
    azuren.desktop.lock = function () {
        azuren.invoke("desktop.lock", {});
    };
    azuren.desktop.unlock = function () {
        azuren.invoke("desktop.unlock", {});
    };
    azuren.desktop.setlock = function (url) {
        azuren.invoke("desktop.setlock", { url: url });
    };
    azuren.store = {};
    azuren.store.install = function (id) {
        azuren.invoke("store.install", { id: id });
    };
    azuren.store.uninstall = function (id) {
        azuren.invoke("store.uninstall", { id: id });
    };
    azuren.desktop.setTheme = function(theme) {
        azuren.invoke("desktop.setTheme", {theme: theme});
    };
    azuren.desktop.clear= function() {
        azuren.invoke("desktop.clear", {});
    };
    azuren.desktop.refresh = function() {
        azuren.invoke("desktop.refresh", {});
    };
    
    azuren.browser = {};
    azuren.browser.open = function(url) {
        azuren.invoke("browser.open", {url:url});
    };
    azuren.app.start = function() {
        azuren.invoke("app.start", {});
    };

})(Azuren);