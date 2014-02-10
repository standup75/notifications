"use strict"
angular.module("demo").controller "MainCtrl", ($scope, Notifications) ->
	$scope.sendError = -> Notifications.sendAlert "This an error/alert message"
	$scope.sendMessage = -> Notifications.sendMessage "This a simple notification"
	null
