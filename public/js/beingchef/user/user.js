app.controller("UserCtrl", function ($scope, $http, $modal, $routeParams, $rootScope, $location, BeingChefService) {
    var username = $routeParams.username;
    $scope.username = username;
    $scope.active = false;
    $scope.active1 = false;
    $scope.isFollow = false;

    if ($rootScope.currentUser != null) {
        BeingChefService.getUserById($rootScope.currentUser._id, function (user) {
            $rootScope.currentUser = user;
            $scope.isUserSameAsLoggedin = (username == $rootScope.currentUser.username);
        })
    } else {
        $scope.isUserSameAsLoggedin = false;
    }

    

    BeingChefService.getUserByUsername(username, function (response) {
        if (response != null) {
            $scope.firstName = response.user.firstName;
            $scope.lastName = response.user.lastName;
            $scope.userid = response.user._id;
            $scope.favorites = response.user.favorites;
            $scope.reviews = response.userReviews;
            for (i in $scope.reviews) {
                $scope.reviews[i].timeSpan = humanized_time_span($scope.reviews[i].creationDate);
            }
            if ($rootScope.currentUser != null) {
                for (var i in $rootScope.currentUser.following) {
                    if ($rootScope.currentUser.following[i] == response.user._id) {
                        $scope.isFollow = true;
                        break;
                    }
                }
            }
        }
    });

    $scope.follow = function () {
        if ($rootScope.currentUser == null) {
            $rootScope.errorMessage = 'Please login/register and retry';
            var modalInstance = $modal.open({
                templateUrl: 'loginregister/login-register.html',
                controller: LoginRegisterCtrl,
                scope: $scope,
                resolve: {
                    type: function () {
                        return 'login'
                    }
                }
            });

            modalInstance.result.then(function () {
                if ($rootScope.currentUser != null) {
                    $scope.isUserSameAsLoggedin = (username == $rootScope.currentUser.username);
                    for (var i in $rootScope.currentUser.following) {
                        if ($rootScope.currentUser.following[i] == $scope.userid) {
                            $scope.isFollow = true;
                        }
                    }
                }
            });
        } else {
            BeingChefService.followUser($rootScope.currentUser._id, $scope.userid, function (response) {
                if (response != null) {
                    $rootScope.currentUser = response;
                    $scope.isFollow = true;
                }
                
            });
        }

        
    }

    $scope.unfollow = function () {
        BeingChefService.unfollowUser($rootScope.currentUser._id, $scope.userid, function (response) {
            if (response != null) {
                $scope.isFollow = false;
            }
        });
    }



})
