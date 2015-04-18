var app = angular.module("BeingChefApp", ['ngRoute', 'ui.bootstrap', 'ngAnimate', 'simplePagination']);

app.controller("BeingChefAppController", function ($route, $scope, $modal, $http, $rootScope, $location, BeingChefService) {
    console.log('Welcome to BeingChef');

    $scope.$on("$locationChangeStart", function (e, currentLocation, previousLocation) {
        //console.log(previousLocation.substring(previousLocation.lastIndexOf('#') + 1));
        $rootScope.previousLocation = previousLocation.substring(previousLocation.lastIndexOf('#') + 1);
    })

    var loggedinUser = BeingChefService.loggedin(function (response) {
        console.log(response);
        if (response != 0) {
            $rootScope.currentUser = response;
        }
        
    })

    $scope.logout = function () {
        $http.post("/logout")
        .success(function () {
            $rootScope.currentUser = null;
            $location.url("/home");
        });
    };

    $scope.showLoginRegisterForm = function (type) {
        var modalInstance = $modal.open({
            templateUrl: 'loginregister/login-register.html',
            controller: LoginRegisterCtrl,
            scope: $scope,
            resolve: {
                type: function () {
                    return type
                }
            }
        });
        modalInstance.result.then(function () {
            if ($rootScope.currentUser != null) {
                $route.reload();
            }
        });
    }

    $scope.showAbout = function () {
        var modalInstance = $modal.open({
            templateUrl: 'misc/about.html',
            controller: AboutCtrl,
            scope: $scope
        });
    }

    $scope.showContact = function () {
        var modalInstance = $modal.open({
            templateUrl: 'misc/contact.html',
            controller: ContactCtrl,
            scope: $scope
        });
    }
})

app.config(function ($routeProvider, $httpProvider) {
    $routeProvider
    .when('/home', {
        templateUrl: 'home/home.html',
        controller: 'HomeCtrl'
    })
    .when('/search/:searchText', {
        templateUrl: 'search/search.html',
        controller: 'SearchCtrl'
    })
    .when('/detail/:recipeId', {
        templateUrl: 'details/details.html',
        controller: 'DetailsCtrl'
    })
    .when('/user/:username', {
        templateUrl: 'user/user.html',
        controller: 'UserCtrl'
    })
    .when('/dashboard', {
        templateUrl: 'dashboard/dashboard.html',
        controller: 'DashboardCtrl',
        resolve: {
            loggedin: checkLoggedin
        }
    })
    .otherwise({
        redirectTo: '/home'
    });
});

var checkLoggedin = function ($q, $timeout, BeingChefService, $location, $rootScope, $modal, $browser) {
    var deferred = $q.defer();

    

    BeingChefService.loggedin(function (user) {
        $rootScope.errorMessage = null;
        // User is Authenticated
        if (user !== '0') {
            $rootScope.currentUser = user;
            deferred.resolve();
        }
            // User is Not Authenticated
        else {
            console.log($rootScope.currentUser);
            $rootScope.errorMessage = 'You need to log in.';
            var modalInstance = $modal.open({
                templateUrl: 'loginregister/login-register.html',
                controller: LoginRegisterCtrl,
                resolve: {
                    type: function () {
                        return 'login'
                    }
                }
            });
            modalInstance.result.then(function () {
                console.log('after login' + $rootScope.currentUser);
                if ($rootScope.currentUser != null) {
                    $location.url('/dashboard');
                    deferred.resolve();
                    
                } else {
                    deferred.reject();
                    $location.url($rootScope.previousLocation);
                }
            }, function () {
                deferred.reject();
                $location.url($rootScope.previousLocation);
                /*$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
                    var prev = $state.href(from, fromParams);
                    console.log(prev);
                    $location.url(prev);
                });*/
            });
        }
    });

    return deferred.promise;
};
