app = angular.module("notifications", [])

app.factory "Notifications", ($timeout, $sce) ->
	crcTable = do ->
		c = undefined
		t = []
		n = 0

		while n < 256
			c = n
			k = 0

			while k < 8
				c = ((if (c & 1) then (0xedb88320 ^ (c >>> 1)) else (c >>> 1)))
				k++
			t[n] = c
			n++
		t

	crc32 = (str) ->
		crc = 0 ^ (-1)
		i = 0

		while i < str.length
			crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xff]
			i++
		(crc ^ (-1)) >>> 0

	MESSAGE: 0
	ALERT: 1
	messages: {}
	timeout: 100
	sendMessage: (msg, leaveIt) -> @_addMessage msg, @MESSAGE, leaveIt
	sendAlert: (alert, leaveIt) -> @_addMessage alert, @ALERT, leaveIt
	setTimeout: (timeout) -> @timeout = timeout
	setMode: (mode) -> @mode = mode
	_addMessage: (msg, msgType, leaveIt) ->
		@clear()  if @mode is "mono"
		id = crc32(msg + msgType)
		if @messages[id]
			$timeout.cancel @messages[id].timer
		else
			@messages[id] =
				content: $sce.trustAsHtml msg
				type: msgType
		@messages[id].timer = @_setTimer(id, @timeout * msg.length) if @timeout and !leaveIt
		id
	_setTimer: (id, duration) ->
		$timeout =>
			@remove id 
		, duration
	clear: ->
		@remove(msg.id)  for msg of @messages
		null
	remove: (id) ->
		if @messages[id]
			$timeout.cancel @messages[id].timer
			delete @messages[id]
		null

app.directive "notifications", ($rootScope, Notifications) ->

	template: """
		<ul class="notifications {{position}}">
			<li
				ng-repeat="(id, message) in notifications.messages"
				ng-class="{ alert: message.type === notifications.ALERT }"
				ng-click="notifications.remove(id)"
				class="notification"
				ng-bind-html="message.content">
			</li>
		</ul>
	"""
	scope: {}
	restrict: "E"
	link: (scope, element, attributes) ->
		Notifications.setTimeout(parseInt(attributes.timeout, 10)) if attributes.timeout
		scope.notifications = Notifications
		scope.position = attributes.position || "bottom"
		Notifications.setMode("mono")  if attributes.mode is "mono"
		$rootScope.$on "$routeChangeStart", -> Notifications.clear()
