"use strict"
angular.module("demo").controller "MainCtrl", ($scope, Notifications) ->
	notificationIds = []
	$scope.sendError = -> notificationIds.push Notifications.sendAlert("This an error/alert message")
	$scope.sendMessage = -> notificationIds.push Notifications.sendMessage("This a simple notification")
	$scope.removeMessages = -> Notifications.remove(id) for id in notificationIds
	null
