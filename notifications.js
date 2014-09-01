(function() {
  var app;

  app = angular.module("notifications", []);

  app.factory("Notifications", function($timeout) {
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
      sendMessage: function(msg) {
        return this._addMessage(msg, this.MESSAGE);
      },
      sendAlert: function(alert) {
        return this._addMessage(alert, this.ALERT);
      },
      setTimeout: function(timeout) {
        return this.timeout = timeout;
      },
      _addMessage: function(msg, msgType) {
        var id, timer;
        id = generateUuid();
        timer = this.setTimer(id, this.timeout * msg.length);
        this.messages[id] = {
          timer: timer,
          content: msg,
          type: msgType
        };
        return id;
      },
      setTimer: function(id, duration) {
        var _this = this;
        return $timeout(function() {
          return _this.remove(id);
        }, duration);
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
        return scope.position = attributes.position || "bottom";
      }
    };
  });

}).call(this);
