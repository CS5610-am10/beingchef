app.controller("SearchCtrl", function ($scope, $http, $routeParams, $rootScope, BeingChefService, $location, Pagination) {
    var searchText = $routeParams.searchText;
    var startTime = new Date();
    BeingChefService.searchRecipes(searchText, function (data) {
        $rootScope.searchResults = data;
        console.log(data);
        if (data.ResultCount == 0) {
            $scope.notFoundString = searchText;
        }
        var endTime = new Date();
        $scope.secs = (endTime.getTime() - startTime.getTime())/1000;

    })

    $scope.pageSize = 10;
    $scope.currentPage = 0;

    $scope.search = function () {
        $location.url("/search/" + $scope.searchText);
    }
});