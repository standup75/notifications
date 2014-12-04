app = angular.module("notifications", [])

app.factory "Notifications", ($timeout, $sce) ->
	generateUuid = ->
		d = new Date().getTime()
		"xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx".replace /[xy]/g, (c) ->
			r = (d + Math.random() * 16) % 16 | 0
			d = Math.floor(d / 16)
			((if c is "x" then r else (r & 0x7 | 0x8))).toString 16

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
		id = generateUuid()
		timer = @_setTimer(id, @timeout * msg.length) if @timeout and !leaveIt
		@messages[id] =
			timer: timer
			content: $sce.trustAsHtml msg
			type: msgType
		id
	_setTimer: (id, duration) ->
		$timeout =>
			@remove id 
		, duration
	clear: -> @remove(msg.id)  for msg of @messages
	remove: (id) ->
		if @messages[id]
			$timeout.cancel @messages[id].timer
			delete @messages[id]

app.directive "notifications", (Notifications) ->

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
		Notifications.setMode("mono")  if attributes.mono
