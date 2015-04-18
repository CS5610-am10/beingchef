app.controller("DashboardCtrl", function ($scope, $http, $modal, $routeParams, $rootScope, $location, BeingChefService) {
    $('ul.tabs li').click(function () {
        var tab_id = $(this).attr('data-target');

        $('ul.tabs li').removeClass('current');
        $('.tab-content').removeClass('current');

        $(this).addClass('current');
        $(tab_id).addClass('current');
    })

    

    $scope.isSuccess = false;
    $scope.successMessage = null;
    $scope.isError = false;
    $scope.errorMessage = null;
    $scope.userNotFound = null;

    $scope.dismissErrorMessage = function () {
        $scope.isError = false;
        $scope.errorMessage = null;
        $scope.userNotFound = null;
    }

    $scope.dismissSuccessMessage = function () {
        $scope.isSuccess = false;
        $scope.successMessage = null;
    }

    BeingChefService.getAllUsers(function (users) {
        $scope.usernames = [];
        for (var i in users) {
            $scope.usernames.push(users[i].username);
        }
       
    });

    $scope.viewUser = function () {
        BeingChefService.getUserByUsername($scope.searchUser, function (response) {
            if (response == null) {
                $scope.userNotFound = "User: " + $scope.searchUser + " not found"
            } else {
                $location.url("/user/" + $scope.searchUser);
            }
        })
        
    }

    BeingChefService.getUserById($rootScope.currentUser._id, function (user) {
        $rootScope.currentUser = user;
        $scope.favorites = $rootScope.currentUser.favorites;
    })

    BeingChefService.getReviewsByUser($rootScope.currentUser._id, function (reviews) {
        $scope.reviews = reviews;
        for (i in $scope.reviews) {
            $scope.reviews[i].timeSpan = humanized_time_span($scope.reviews[i].creationDate);
        } 
    })

    BeingChefService.getFollowing($rootScope.currentUser._id, function (followingUsers) {
        $scope.following = followingUsers;
    })

    $scope.unfollow = function (index, id) {
        BeingChefService.unfollowUser($rootScope.currentUser._id, id, function (response) {
            if (response != null) {
                $rootScope.currentUser.following.splice(index, 1)
                $scope.following.splice(index, 1);
            }
        });
    }

    $scope.removeFavorite = function (id) {
        BeingChefService.removeFavorite($rootScope.currentUser._id, id, function (response) {
            $rootScope.currentUser.favorites = response
            $scope.favorites = response;
        });
    }

    $scope.removeReview = function (review) {
        BeingChefService.removeReview($rootScope.currentUser._id, review.recipeId, review._id, function (response) {
            if (response != null) {
                $rootScope.currentUser.reviews = response
                $scope.reviews.splice($scope.reviews.indexOf(review), 1);
            }
        });
    }

    $scope.addGroceryItem = function (item) {
        if (item == null || item.Name == null || item.Quantity == null) {
            $scope.isError = true;
            $scope.errorMessage = "Please enter grocery item name and quantity";
        } else if (isNaN(item.Quantity)) {
            $scope.isError = true;
            $scope.errorMessage = "Please enter a number for grocery item quantity";
        } else {
            BeingChefService.addToGroceryList($rootScope.currentUser._id, [item], function (response) {
                if (response != null) {
                    $rootScope.currentUser = response;
                    $scope.isSuccess = true;
                    $scope.successMessage = "Item added successfully";
                }
            });
        }
    }

    $scope.deleteGroceryItem = function (itemId) {
        BeingChefService.deleteGroceryItem($rootScope.currentUser._id, itemId, function (response) {
            if (response != null) {
                $rootScope.currentUser = response;
            }
        });
    }

});