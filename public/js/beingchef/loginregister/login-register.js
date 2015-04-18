var LoginRegisterCtrl = function ($rootScope, $scope, $modalInstance, type, BeingChefService) {

    var loginHeader = 'Login to Your Account';
    var registerHeader = 'Register New Account'; 
    if (type == 'register') {
        $scope.isLogin = false;
        $scope.header = registerHeader;
    } else {
        $scope.isLogin = true;
        $scope.header = loginHeader;
    }
    $scope.loginUser = function (user) {
        BeingChefService.loginUser(user, function (response) {
            if (response == null) {
                $scope.errorMessage = 'Invalid username or password';
            } else {
                $rootScope.currentUser = response;
                $modalInstance.close();
            }
        });
    };

    $scope.registerUser = function (user) {
        if (user.password != user.password2) {
            $scope.errorMessage = 'Both the passwords should match';
        } else {
            BeingChefService.registerUser(user, function (response) {
                if (response == null) {
                    $scope.errorMessage = 'User already exists';
                } else {
                    $rootScope.currentUser = response;
                    $modalInstance.close();
                }
            });
        }
        
        
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
        //$modalInstance.close();
    };

    $scope.showRegisterForm = function () {
        $scope.isLogin = false;
        $scope.header = registerHeader;
    }

    $scope.showLoginForm = function () {
        $scope.isLogin = true;
        $scope.header = loginHeader;
    }

};

