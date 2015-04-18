app.factory('BeingChefService', function beingChefService($http) {
    var bigOvenAPIKey = 'dvx8WTvxP086a6e2UOq8WAEshrVibl4y'

    var searchRecipes = function (searchText, callback) {
        var titleKeyword = searchText;
        var url = "http://api.bigoven.com/recipes?pg=1&rpp=200&any_kw="
                  + titleKeyword
                  + "&api_key=" + bigOvenAPIKey;
        $http.get(url).
        success(callback)
    };

    var getRecipeDetails = function (recipeId, callback) {
        var url = "http://api.bigoven.com/recipe/" + recipeId + "?api_key=" + bigOvenAPIKey;
        $http.get(url).
        success(callback)
    }

    var getRecipeFromExternalId = function (recipeId, callback) {
        $http.get("/recipe/" + recipeId)
        .success(callback)
    }

    var registerUser = function (user, callback) {
        if (user.password != user.password2 || !user.password || !user.password2) {
            $rootScope.message = "Your passwords don't match";
        }
        else {
            $http.post("/register", user)
            .success(callback);
        }
    }

    var loginUser = function (user, callback) {
        $http.post("/login", user)
        .success(callback)
        .error(function (response, status) {
            if (status == 401) {
                console.log('hello');
                callback(null);
            }
        });;
    }

    var loggedin = function (callback) {
        $http.get("/loggedin")
        .success(callback)
    }

    var getFavorites = function (userid, callback) {
        $http.get("/favorite/" + userid)
        .success(callback)
    }

    var getReviewsByUser = function (userid, callback) {
        $http.get("/reviewbyuser/" + userid)
        .success(callback)
    }

    var getReviewsByRecipe = function (recipeid, callback) {
        $http.get("/reviewbyrecipe/" + recipeid)
        .success(callback)
    }

    var removeFavorite = function (userid, favoriteid, callback) {
        data = { userid: userid, favoriteid: favoriteid };
        $http.post("/remove_favorite", data)
        .success(callback);
    }

    var removeReview = function (userid, recipeid, reviewid, callback) {
        data = { userid: userid, recipeid: recipeid, reviewid: reviewid };
        $http.post("/remove_review", data)
        .success(callback);
    }

    var getUserById = function (userid, callback) {
        $http.get("/user/" + userid)
        .success(callback);
    }

    var getUserByUsername = function (username, callback) {
        $http.get("/username/" + username)
        .success(callback);
    }

    var followUser = function (userid, followid, callback) {
        data = { userId: userid, followId: followid };
        $http.post("/follow", data)
        .success(callback);
    }

    var unfollowUser = function (userid, followid, callback) {
        data = { userId: userid, followId: followid };
        $http.post("/unfollow", data)
        .success(callback);
    }

    var getFollowing = function (userid, callback) {
        $http.get("/following/" + userid)
        .success(callback);
    }

    var addToGroceryList = function (userid, groceryList, callback) {
        $http.post("/grocery", { userId: userid, groceryList: groceryList })
        .success(callback);
    }

    var deleteGroceryItem = function (userid, groceryid, callback) {
        $http.delete("/grocery/" + userid + "/" + groceryid)
        .success(callback);
    }

    var getAllUsers = function (callback) {
        $http.get("/user")
        .success(callback);
    }

    return {
        searchRecipes: searchRecipes,
        registerUser: registerUser,
        loginUser: loginUser,
        loggedin: loggedin,
        getRecipeDetails: getRecipeDetails,
        getRecipeFromExternalId: getRecipeFromExternalId,
        getFavorites: getFavorites,
        getReviewsByUser: getReviewsByUser,
        getReviewsByRecipe: getReviewsByRecipe,
        removeReview: removeReview,
        removeFavorite: removeFavorite,
        getUserById: getUserById,
        getUserByUsername: getUserByUsername,
        followUser: followUser,
        unfollowUser: unfollowUser,
        getFollowing: getFollowing,
        addToGroceryList: addToGroceryList,
        deleteGroceryItem: deleteGroceryItem,
        getAllUsers: getAllUsers
    }
});