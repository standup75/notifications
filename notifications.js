(function() {
  var app;

  app = angular.module("notifications", []);

  app.factory("Notifications", function($timeout, $sce) {
    var crc32, crcTable;
    crcTable = (function() {
      var c, k, n, t;
      c = void 0;
      t = [];
      n = 0;
      while (n < 256) {
        c = n;
        k = 0;
        while (k < 8) {
          c = (c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1);
          k++;
        }
        t[n] = c;
        n++;
      }
      return t;
    })();
    crc32 = function(str) {
      var crc, i;
      crc = 0 ^ (-1);
      i = 0;
      while (i < str.length) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff];
        i++;
      }
      return (crc ^ (-1)) >>> 0;
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
        var id;
        if (this.mode === "mono") {
          this.clear();
        }
        id = crc32(msg + msgType);
        if (this.messages[id]) {
          $timeout.cancel(this.messages[id].timer);
        } else {
          this.messages[id] = {
            content: $sce.trustAsHtml(msg),
            type: msgType
          };
        }
        if (this.timeout && !leaveIt) {
          this.messages[id].timer = this._setTimer(id, this.timeout * msg.length);
        }
        return id;
      },
      _setTimer: function(id, duration) {
        var _this = this;
        return $timeout(function() {
          return _this.remove(id);
        }, duration);
      },
      clear: function() {
        var msg;
        for (msg in this.messages) {
          this.remove(msg.id);
        }
        return null;
      },
      remove: function(id) {
        if (this.messages[id]) {
          $timeout.cancel(this.messages[id].timer);
          delete this.messages[id];
        }
        return null;
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
        if (attributes.mode === "mono") {
          return Notifications.setMode("mono");
        }
      }
    };
  });

}).call(this);
