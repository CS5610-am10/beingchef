var app = angular.module("PassportApp", ["ngRoute"]);


app.config(function ($routeProvider, $httpProvider) {
    $httpProvider.defaults.headers.common = { 'Accept': 'application/json' };
    $routeProvider
     .when('/login', {
         templateUrl: 'views/login/login.html'
         //controller: 'LoginController',
     })
    .when('/home', {
        templateUrl: 'views/home/home.html'
        //controller: 'LoginController',
    })
    .when('/profile', {
        templateUrl: 'views/profile/profile.html',
        controller: 'LoginCtrl',
    })
});

app.controller("PassportAppController", function ($scope, $http) {
    console.log('hello');
    
    
})
