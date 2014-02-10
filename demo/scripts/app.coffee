"use strict"
angular.module("demo", ["notifications", "ngRoute"]).config ($routeProvider) ->
  $routeProvider.when("/",
    templateUrl: "views/main.html"
    controller: "MainCtrl"
  ).otherwise redirectTo: "/"
