app.controller("HomeCtrl", function ($scope, $rootScope, BeingChefService, $location) {
    $scope.search = function () {
        $location.url("/search/" + $scope.searchText);
    }
});