

function UserInfoCtrl($scope, googleDrive, $cookieStore) {

    $scope.CLIENT_ID = '852549593040.apps.googleusercontent.com';
    $scope.SCOPES = 'https://www.googleapis.com/auth/drive';
    $scope.userInfo = {};
    $scope.connected = false;
    $scope.rootFolder = { "id": null, "title": null };  //$cookieStore.get("rootFolder");

    $scope.Math = window.Math;

    $scope.connect = function () {
        googleDrive.connect($scope);
    }

    $scope.disconnect = function () {

    }

    $scope.selectDriveFolder = function () {

        var newDrive = prompt("What?");

        if (newDrive) {

            $cookieStore.put("rootFolder", newDrive);
        }
    }

    googleDrive.load($scope);


//      /**
//       * Insert new file.
//       *
//       * @param {File} fileData File object to read data from.
//       * @param {Function} callback Function to call when the request is complete.
//       */
//      function insertFile(fileData, callback) {
//        var boundary = '-------314159265358979323846';
//        var delimiter = "\r\n--" + boundary + "\r\n";
//        var close_delim = "\r\n--" + boundary + "--";

//        var reader = new FileReader();
//        reader.readAsBinaryString(fileData);
//        reader.onload = function(e) {
//          var contentType = fileData.type || 'application/octet-stream';
//          var metadata = {
//            'title': fileData.name,
//            'mimeType': contentType
//          };

//          var base64Data = btoa(reader.result);
//          var multipartRequestBody =
//              delimiter +
//              'Content-Type: application/json\r\n\r\n' +
//              JSON.stringify(metadata) +
//              delimiter +
//              'Content-Type: ' + contentType + '\r\n' +
//              'Content-Transfer-Encoding: base64\r\n' +
//              '\r\n' +
//              base64Data +
//              close_delim;

//          var request = gapi.client.request({
//              'path': '/upload/drive/v2/files',
//              'method': 'POST',
//              'params': {'uploadType': 'multipart'},
//              'headers': {
//                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
//              },
//              'body': multipartRequestBody});
//          if (!callback) {
//            callback = function(file) {
//              console.log(file)
//            };
//          }
//          request.execute(callback);
//        }
//      }
}