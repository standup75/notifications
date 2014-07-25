app = angular.module("notifications", [])

app.factory "Notifications", ($timeout) ->
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
	sendMessage: (msg) -> @_addMessage msg, @MESSAGE
	sendAlert: (alert) -> @_addMessage alert, @ALERT
	setTimeout: (timeout) -> @timeout = timeout
	_addMessage: (msg, msgType) ->
		id = generateUuid()
		timer = @setTimer id, @timeout * msg.length
		@messages[id] =
			timer: timer
			content: msg
			type: msgType
		id
	setTimer: (id, duration) ->
		$timeout =>
			@remove id 
		, duration
	remove: (id) ->
		if @messages[id]
			$timeout.cancel @messages[id].timer
			delete @messages[id]

app.directive "notifications", (Notifications) ->

	template: """
		<ul class="notifications">
			<li
				ng-repeat="(id, message) in notifications.messages"
				ng-class="message.type === notifications.ALERT ? 'alert' : ''"
				ng-click="notifications.remove(id)"
				class="notification"
				ng-bind="message.content">
			</li>
		</ul>
	"""
	scope: {}
	replace: true
	restrict: "E"
	link: (scope, element, attributes) ->
		Notifications.setTimeout(parseInt(attributes.timeout, 10)) if attributes.timeout
		scope.notifications = Notifications
