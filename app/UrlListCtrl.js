

function UrlListCtrl($scope, $rootScope, $timeout, googleDrive) {

    $scope.newMark = resetMarker();
    $scope.hotLabels = [
        "travel", "tips", "flights"];

    $scope.successMessage = null;

    $scope.marks = []

    $scope.$on("GoogleDriveLoaded", function () {
    googleDrive.loadBookmarks(
        function (list) {
            $scope.marks = list;
        });
    });

    $scope.hideAlerts = function() {
        $scope.successMessage = null;
    };

    $scope.deleteMark = function (mark) {

        var newMarks = $.grep($scope.marks, function (elem, index) {
            return elem.url != mark.url;
        });

        googleDrive.updateLinkFile(
            newMarks,
            $rootScope.rootFolder.id,
            $rootScope.bookmarkFile.id,
            function () {   /*successCallback:*/
                $scope.marks = newMarks;

                $scope.successMessage = {
                    "label": "Cool!",
                    "text": "It worked!"
                };
                $scope.$digest();
                $timeout($scope.hideAlerts, 3000, true);
            },
            function () {   /*errorCallback:*/
                alert("Error deleting links to drive");
            });
    };

    $scope.save = function (form, mark) {

        if (!form.$valid) return;

        if ($.grep($scope.marks, function (item, index) { return item.url == mark.url }).length > 0) {
            alert("'" + mark.url + "' is already bookmarked");
            $scope.newMark = resetMarker();
            return;
        }

        if (!mark.name || mark.name == "") {
            var parts = mark.url.split("/")[2].split(".");

            if (parts[0].indexOf("www") == 0) {
                parts.shift();
            }
            if (parts.length >= 2) {
                parts.pop();
            }

            mark.name = parts.join(".");
        }

        if (!mark.labels || mark.labels.length == 0) {
            mark.labels = ["undefined"];
        }

        console.log(mark);


        if (!$rootScope.bookmarkFile.id || !$rootScope.rootFolder.id) {
            alert("Error: missing bookmark file or root folder");
        }

        var marksCopy = angular.copy($scope.marks);
        marksCopy.push(mark);

        googleDrive.updateLinkFile(
            marksCopy,
            $rootScope.rootFolder.id,
            $rootScope.bookmarkFile.id,
            /*successCallback:*/ function () {
                $scope.marks.push(mark);
                $scope.newMark = resetMarker();

                $scope.successMessage = {
                    "label": "Cool!",
                    "text": "It worked!"
                };
                $scope.$digest();
                $timeout($scope.hideAlerts, 3000, true);
            },
            /*errorCallback:*/ function () {
                alert("Error saving link to drive");
            });
    }


    /*********************/
    /* UTILITY FUNCTIONS */

    function resetMarker() {
        return { "url": "", "name": "", "labels": []};
    }

    var _to = null;

    $("#newMark").keyup(function (event) {

        var updater = function () {
            var url = $("#newMark").val();
            if (url.length > 0) {

                if (url.indexOf("http") != 0) {
                    //$("#newMark").val("http://" + url);
                    $scope.$apply(function () {
                        $scope.newMark.url = "http://" + url;
                    });
                }
            }
        }

        if (_to) {
            clearTimeout(_to);
        }

        _to = setTimeout(updater, 250);
    });

    var _toLabels = null;

    $("#newLabels").keyup(function (event) {
        var $self = $(this);
        
        if (_toLabels) { clearTimeout(_toLabels); }

        _toLabels = setTimeout(function () {

            $scope.$apply(function () {
                var tmpLabels = $self.val().split(",");

                $scope.newMark.labels = [];
                for (key in tmpLabels) {
                    var v = $.trim(tmpLabels[key]);

                    if (v.length > 0 && $.inArray(v, $scope.newMark.labels) < 0) {
                        $scope.newMark.labels.push(v);
                    }
                }
            });
        }, 150);
    });
}