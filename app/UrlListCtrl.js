

function UrlListCtrl($scope, $rootScope, $timeout, googleDrive, $route, $routeParams) {

    $scope.newMark = resetMarker();
    $scope.hotLabels = [
        "travel", "tips", "flights"];

    $scope.successMessage = null;

    $scope.marks = []

    $scope.$on("GoogleDriveLoaded", function () {
        googleDrive.loadBookmarks(
            function (list) {
                $scope.marks = list;
                $rootScope.loaderOff();
            });
    });

    // Listen for changes to the Route. When the route
    // changes, let's set the renderAction model value so
    // that it can render in the Strong element.
    $scope.$on(
        "$routeChangeSuccess",
        function( $currentRoute, $previousRoute ){
 
            // Update the rendering.
            render();
 
        }
    );

    $scope.hideAlerts = function() {
        $scope.successMessage = null;
    };

    $scope.editMark = function (oldMark, newMark) {
        $scope.loaderOn();
        $timeout(function () { $scope.loaderOff(); }, 2000);
    };

    $scope.deleteMark = function (mark) {
        $scope.loaderOn();
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
                $scope.loaderOff();
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

        $scope.loaderOn();
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
        /*successCallback:*/function () {
            $scope.marks.push(mark);
            $scope.newMark = resetMarker();

            $scope.successMessage = {
                "label": "Cool!",
                "text": "It worked!"
            };
            $scope.loaderOff();
            $scope.$digest();
            $timeout($scope.hideAlerts, 3000, true);
        },
        /*errorCallback:*/function () {
            alert("Error saving link to drive");
        });
    }

    // Update the rendering of the page.
    // source : http://www.bennadel.com/blog/2420-Mapping-AngularJS-Routes-Onto-URL-Parameters-And-Client-Side-Events.htm
    render = function () {

        // Pull the "action" value out of the
        // currently selected route.
        var renderAction = $route.current.action;

        // Also, let's update the render path so that
        // we can start conditionally rendering parts
        // of the page.
        var renderPath = renderAction.split(".");

        // Grab the username out of the params.
        //
        // NOTE: This will be undefined for every route
        // except for the "contact" route; for the sake
        // of simplicity, I am not exerting any finer
        // logic around it.
        var labelname = ($routeParams.labelname || "");

        // Reset the booleans used to set the class
        // for the navigation.
        var isHome = (renderPath[0] == "home");
        var isLabel = (renderPath[0] == "label");

        // Store the values in the model.
        $scope.renderAction = renderAction;
        $scope.renderPath = renderPath;
        $scope.labelname = labelname;
        $scope.isHome = isHome;
        $scope.isLabel = isLabel;
    };


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