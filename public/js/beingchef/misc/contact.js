﻿var ContactCtrl = function ($scope, $modalInstance) {
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        //$modalInstance.close();
    };
}