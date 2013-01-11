

var app = angular.module("drivemark", ["ngCookies"]);


app.factory("googleDrive", function ($rootScope) {

    var googleDrive = {};

    googleDrive.CLIENT_ID = '852549593040.apps.googleusercontent.com';
    googleDrive.SCOPES = 'https://www.googleapis.com/auth/drive';
    googleDrive.bookmarkFileName = "DriveMark_bookmarks.txt";

    // stores $scope from UserInfoCtrl
    googleDrive.data = null;


    // entry point for this service
    googleDrive.load = function (scope) {
        // load library, on callback => checkAuth, on callback => call callback!
        this.data = scope;

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
                        scope.rootFolder = {
                            "id": scope.userInfo.rootFolderId,
                            "title": ""
                        };
                        scope.$digest();

                        if (!scope.rootFolder.title) {
                            var request = gapi.client.drive.files.get({
                                'fileId': scope.userInfo.rootFolderId
                            });
                            request.execute(function (resp) {
                                scope.rootFolder.title = resp.title;
                                scope.$digest();
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

        gapi.auth.authorize(
                    { 'client_id': self.CLIENT_ID, 'scope': self.SCOPES, 'immediate': false },
                    function (authResult) { self.handleAuthResult(authResult); });
    };

    googleDrive.fileExists = function (folder, fileName) {
        return false;
    };

    googleDrive.createFile = function (folder, fileName, content) {

    };

    googleDrive.readBookmarks = function () {
        console.log(this.data);
        var folder = this.data.rootFolder;

        // detect if file is present
        if (!this.fileExists(folder, this.bookmarkFileName)
            && confirm("Bookmark file is not present. Create it in '" + folder.title + "' ?")) {    // if not present ask for creation

            this.createFile(folder, this.bookmarkFileName, [
                { "name": "Google",
                    "url": "http://www.google.com",
                    "labels": ["search"]
                },
                { "name": "David Geretti",
                    "url": "http://davidgeretti.ch",
                    "labels": ["awesome", "bookmark"]
                }
            ]);
        }

        // load marks


        return [
            { "name": "Bootsnall",
                "url": "http://www.bootsnall.com/rtw/planning",
                "labels": ["travel", "tips"]
            },
            { "name": "Alexmaccaw",
                "url": "http://alexmaccaw.com/posts/how_to_travel_around_the_world",
                "labels": ["travel", "tips"]
            },
            { "name": "Oneworld",
                "url": "http://www.oneworld.com/",
                "labels": ["travel", "flights"]
            }
        ];
    };

    return googleDrive;
});