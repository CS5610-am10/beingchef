app.filter('range', function () {
    return function (val, range) {
        range = parseInt(range);
        for (var i = 0; i < range; i++)
            val.push(i);
        return val;
    };
});


app.controller("DetailsCtrl", function ($scope, $http, $modal, $routeParams, $rootScope, $location, BeingChefService) {
    
    
    $scope.isSuccess = false;
    $scope.successMessage = null;
    $scope.reviewComment = null;
   
    $scope.dismissSuccessMessage = function () {
        $scope.isSuccess = false;
        $scope.successMessage = null;
    }

    var recipeId = $routeParams.recipeId;
    if ($rootScope.currentUser != null) {
        BeingChefService.getUserById($rootScope.currentUser._id, function (user) {
            $rootScope.currentUser = user;
        })
    }
    $scope.isFavorite = false;
    $scope.favoriteId = null;
    $scope.dishReviews = [];
    var getRecipeDetails = BeingChefService.getRecipeDetails(recipeId, function (data) {
        $scope.dish = data;
        BeingChefService.getRecipeFromExternalId(recipeId, function (data) {
            if (data != null) {
                $scope.dish._id = data._id;
                if ($rootScope.currentUser != null) {
                    for (var i in $rootScope.currentUser.favorites) {
                        if ($rootScope.currentUser.favorites[i].recipeId == $scope.dish.RecipeID) {
                            $scope.isFavorite = true;
                            $scope.favoriteId = $rootScope.currentUser.favorites[i]._id;
                        }
                    }
                }
                BeingChefService.getReviewsByRecipe(recipeId, function (reviews) {
                    $scope.dishReviews = reviews;
                    for (i in $scope.dishReviews) {
                        $scope.dishReviews[i].timeSpan = humanized_time_span($scope.dishReviews[i].creationDate);
                    }
                })
            }
        });
    });



    var handleLogin = function () {
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
                for (var i in $rootScope.currentUser.favorites) {
                    if ($rootScope.currentUser.favorites[i].recipeId == $scope.dish.RecipeID) {
                        $scope.isFavorite = true;
                        $scope.favoriteId = $rootScope.currentUser.favorites[i]._id;
                    }
                }
            }
        });
    }

    $scope.addToFavorite = function (dish) {
        if ($rootScope.currentUser == null) {
            handleLogin();
        } else {
            var reqData = { user: $rootScope.currentUser._id, dish: dish }
            $http.post('/favorite', reqData)
            .success(function (data) {
                $rootScope.currentUser = data.user;
                $scope.dish._id = data.recipeDataId;
                $scope.isFavorite = true;
                var favLength = $rootScope.currentUser.favorites.length;
                $scope.favoriteId = $rootScope.currentUser.favorites[favLength-1]._id;
                //$location.url('/favorite');
            })
        }
    }

    $scope.addToGroceryList = function () {
        if ($rootScope.currentUser == null) {
            handleLogin();
        } else {
            if ($scope.dish == null || $scope.dish.Ingredients == null){
                $scope.errorMessage = "No dish ingredients available to add";
            }
            BeingChefService.addToGroceryList($rootScope.currentUser._id, $scope.dish.Ingredients, function (response) {
                if (response != null) {
                    $scope.successMessage = "Dish ingredients added successfully to your grocery list"
                    $scope.isSuccess = true;
                    $rootScope.currentUser.groceryList = response;
                }
            })
        }
        
    }

    $scope.removeFromFavorite = function () {
        BeingChefService.removeFavorite($rootScope.currentUser._id, $scope.favoriteId, function (response) {
            $scope.isFavorite = false;
            $scope.favoriteId = null;
            $rootScope.currentUser.favorites = response
        });
    }

    $scope.addReview = function () {      
        if ($rootScope.currentUser == null) {
            handleLogin();
        } else {
            review = {};
            review.comment = $scope.reviewComment;
            review.rating = $scope.currentRating;
            review.username = $rootScope.currentUser.username;
            review.recipeTitle = $scope.dish.Title;
            review.recipeUrl =  $scope.dish.ImageURL;
            review.recipeId = $scope.dish.RecipeID;
            var reqData = {
                user: $rootScope.currentUser._id,
                dish: $scope.dish,
                review: review
            }
            $http.post('/review', reqData)
            .success(function (data) {
                if (data != null) {
                    $rootScope.currentUser = data.user;
                    $scope.dish._id = data.recipe._id;
                    data.review.timeSpan = humanized_time_span(data.review.creationDate);
                    $scope.dishReviews.push(data.review);
                }
                
                //$location.url('/favorite');
            })
        }
        $scope.review = {};
    }

    $(function () {
        $('#rating').on('change', function () {
            $scope.currentRating = $(this).val();
        });
    });


});
