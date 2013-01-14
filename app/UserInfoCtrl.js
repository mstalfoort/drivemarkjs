

function UserInfoCtrl($scope, $rootScope, googleDrive, $cookieStore) {

    $scope.CLIENT_ID = '852549593040.apps.googleusercontent.com';
    $scope.SCOPES = 'https://www.googleapis.com/auth/drive';
    $scope.userInfo = {};
    $scope.connected = false;


    $scope.Math = window.Math;

    $scope.connect = function () {
        googleDrive.connect($scope);
    }

    $scope.disconnect = function () {
        alert("Not yet implemented");
    }

    $scope.selectDriveFolder = function () {

        var newDrive = prompt("What?");

        if (newDrive) {

            $cookieStore.put("rootFolder", newDrive);
        }
    }

    googleDrive.load($scope);
}