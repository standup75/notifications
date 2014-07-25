"use strict"
angular.module("demo", ["notifications", "ngRoute", "ngAnimate"]).config ($routeProvider) ->
  $routeProvider.when("/",
    templateUrl: "views/main.html"
    controller: "MainCtrl"
  ).otherwise redirectTo: "/"
