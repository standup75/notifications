(function() {
  var app;

  app = angular.module("notifications", []);

  app.factory("Notifications", function($timeout, $sce) {
    var generateUuid;
    generateUuid = function() {
      var d;
      d = new Date().getTime();
      return "xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r;
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : r & 0x7 | 0x8).toString(16);
      });
    };
    return {
      MESSAGE: 0,
      ALERT: 1,
      messages: {},
      timeout: 100,
      sendMessage: function(msg, leaveIt) {
        return this._addMessage(msg, this.MESSAGE, leaveIt);
      },
      sendAlert: function(alert, leaveIt) {
        return this._addMessage(alert, this.ALERT, leaveIt);
      },
      setTimeout: function(timeout) {
        return this.timeout = timeout;
      },
      setMode: function(mode) {
        return this.mode = mode;
      },
      _addMessage: function(msg, msgType, leaveIt) {
        var id, timer;
        if (this.mode === "mono") {
          this.clear();
        }
        id = generateUuid();
        if (this.timeout && !leaveIt) {
          timer = this._setTimer(id, this.timeout * msg.length);
        }
        this.messages[id] = {
          timer: timer,
          content: $sce.trustAsHtml(msg),
          type: msgType
        };
        return id;
      },
      _setTimer: function(id, duration) {
        var _this = this;
        return $timeout(function() {
          return _this.remove(id);
        }, duration);
      },
      clear: function() {
        var msg, _results;
        _results = [];
        for (msg in this.messages) {
          _results.push(this.remove(msg.id));
        }
        return _results;
      },
      remove: function(id) {
        if (this.messages[id]) {
          $timeout.cancel(this.messages[id].timer);
          return delete this.messages[id];
        }
      }
    };
  });

  app.directive("notifications", function(Notifications) {
    return {
      template: "<ul class=\"notifications {{position}}\">\n	<li\n		ng-repeat=\"(id, message) in notifications.messages\"\n		ng-class=\"{ alert: message.type === notifications.ALERT }\"\n		ng-click=\"notifications.remove(id)\"\n		class=\"notification\"\n		ng-bind-html=\"message.content\">\n	</li>\n</ul>",
      scope: {},
      restrict: "E",
      link: function(scope, element, attributes) {
        if (attributes.timeout) {
          Notifications.setTimeout(parseInt(attributes.timeout, 10));
        }
        scope.notifications = Notifications;
        scope.position = attributes.position || "bottom";
        if (attributes.mono) {
          return Notifications.setMode("mono");
        }
      }
    };
  });

}).call(this);
