

var app = angular.module("drivemark", ["ngCookies"]);


app.factory("googleDrive", function ($rootScope, $http) {

    delete $http.defaults.headers.common["X-Requested-With"];   // deletes the X-Requested-With header (for XHR requests): incompatible with Google API

    var googleDrive = {};

    googleDrive.CLIENT_ID = '852549593040.apps.googleusercontent.com';
    googleDrive.SCOPES = 'https://www.googleapis.com/auth/drive';
    googleDrive.bookmarkFileName = "DriveMark_bookmarks.json";

    $rootScope.rootFolder = { "id": null, "title": null };  //$cookieStore.get("rootFolder");
    $rootScope.bookmarkFile = { "id": null, "title": null };


    googleDrive._boundary = '-------314159265358979323846';
    googleDrive._delimiter = "\r\n--" + googleDrive._boundary + "\r\n";
    googleDrive._close_delim = "\r\n--" + googleDrive._boundary + "--";

    // stores $scope from UserInfoCtrl
    googleDrive.data = null;


    // entry point for this service
    googleDrive.load = function (scope) {
        // load library, on callback => checkAuth, on callback => call callback!
        this.data = scope;
        $rootScope.loaderOn();
        this.checkAuth();
    };

    // check current Auth status
    googleDrive.checkAuth = function () {
        var self = this;

        setTimeout(function () {
            gapi.auth.authorize(
                        { 'client_id': self.CLIENT_ID, 'scope': self.SCOPES, 'immediate': true },
                        function (authResult) { self.handleAuthResult(authResult); });
        }, 1);
    };

    // check whether or not app should auth against google API, and init user infos when auth'd
    googleDrive.handleAuthResult = function (authResult) {
        var self = this;
        var scope = this.data;

        if (authResult && !authResult.error) {
            // Access token has been successfully retrieved, requests can be sent to the API.
            // load client to retrieve user information
            gapi.client.load('drive', 'v2', function () {

                var request = gapi.client.drive.about.get();
                request.execute(function (resp) {
                    if (!resp.error) {

                        scope.connected = true;
                        scope.userInfo = resp;
                        $rootScope.rootFolder = {
                            "id": scope.userInfo.rootFolderId,
                            "title": ""
                        };
                        //scope.$digest();

                        if (!$rootScope.rootFolder.title) {
                            var request = gapi.client.drive.files.get({
                                'fileId': scope.userInfo.rootFolderId
                            });
                            request.execute(function (resp) {
                                $rootScope.rootFolder.title = resp.title;
                                //scope.$digest();
                                $rootScope.$broadcast("GoogleDriveLoaded");

                            });
                        } else {
                            $rootScope.$broadcast("GoogleDriveLoaded");
                        }

                    } else {
                        alert("Error! unable to retrieve user information");
                    }
                });

            });

        } else {
            // No access token could be retrieved, show the button to start the authorization flow.

            scope.$apply(function () {
                scope.connected = false;
            });
        }
    };

    // respond to connect menu
    googleDrive.connect = function () {
        var self = this;
        gapi.auth.authorize(
                    { 'client_id': self.CLIENT_ID, 'scope': self.SCOPES, 'immediate': false },
                    function (authResult) { self.handleAuthResult(authResult); });
    };


    googleDrive.getFile = function (folder, fileName, callbackWithMeta, errorCallback) {

        var request = gapi.client.drive.files.list({
            "maxResults": 1,
            "q": "title = '" + fileName + "' and '" + folder.id + "' in parents"
        });

        request.execute(function (resp) {
            if (resp.items && resp.items.length > 0) {
                callbackWithMeta(resp.items[0]);
            } else {
                errorCallback();
            }
        });
    };

    googleDrive.createFile = function (folder, fileName, content, createdCallback) {
        alert("Not yet implemented");
        createdCallback();
    };

    googleDrive.updateLinkFile = function (marks, folderId, fileId, successCallback, errorCallback) {
        //function updateFile(fileId, fileMetadata, fileData, callback) {

        var contentType = "application/json";
        var metaData = { "mimeType": contentType };

        var multipartRequestBody =
            this._delimiter + "Content-type: application/json\r\n\r\n" +
            JSON.stringify(metaData) +
            this._delimiter + "Content-type: " + contentType + "\r\n\r\n" +
            JSON.stringify(marks) +
            this._close_delim;

        var request = gapi.client.request({
            "path": "/upload/drive/v2/files/" + folderId,
            "method": "PUT",
            "params": { "fileId": fileId, "uploadType": "multipart" },
            "headers": { "Content-type": "application/json" },
            "body": angular.toJson(marks, true)
        });

        request.execute(function (resp) {
            if (!resp.error) {
                successCallback();
            } else {
                errorCallback();
            }
        });
    };

    googleDrive.readBookmarks = function (fileRsc, readCallback) {

        // open file with download url from fileMeta (fileRsc)
        if (fileRsc.downloadUrl) {

            var accessToken = gapi.auth.getToken().access_token;

            $http({ method: "GET", url: fileRsc.downloadUrl, headers: { "Authorization": "Bearer " + accessToken} })
                .success(function (data) { readCallback(data); })
                .error(function (data) { alert("Error: cannot read file content"); });

        } else {
            console.log(fileRsc);
            alert("Error reading file: '" + fileRsc.title + "'. Format seems to be incorrect");
        }
    }

    googleDrive.loadBookmarks = function (loadedCallback) {
        var self = this;
        var folder = $rootScope.rootFolder;

        this.getFile(folder, this.bookmarkFileName,
            function (fileMeta) {    // exists, here is the meta (with the download link)!
                $rootScope.bookmarkFile = fileMeta;
                self.readBookmarks(fileMeta, function (list) {
                    loadedCallback(list);
                });
            },
            function () {   // doesn't exist

                if (confirm("Bookmark file is not present. Create it in '" + folder.title + "' ?")) {    // if not present ask for creation
                    self.createFile(folder, self.bookmarkFileName, [
                        { "name": "Google",
                            "url": "http://www.google.com",
                            "labels": ["search"]
                        },
                        { "name": "David Geretti",
                            "url": "http://davidgeretti.ch",
                            "labels": ["awesome", "bookmark"]
                        }
                    ],
                    function () {
                        self.readBookmarks(function (list) {
                            loadedCallback(self.readBookmarks());
                        });
                    });
                }
            });
    };

    return googleDrive;
});


app.directive("dgLoader", function ($rootScope) {

    return function (scope, element, attrs) {

        $rootScope.loaderOn = function () {
            $rootScope.$broadcast("LoaderOn");
        };

        $rootScope.loaderOff = function () {
            $rootScope.$broadcast("LoaderOff");
        };

        scope.$on("LoaderOn", function () {
            element.fadeIn('fast');
        });
        scope.$on("LoaderOff", function () {
            element.fadeOut('fast');
        });
    };
});