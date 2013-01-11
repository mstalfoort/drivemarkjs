

function UrlListCtrl($scope, googleDrive) {

    $scope.newMark = resetMarker();
    $scope.hotLabels = [
        "travel", "tips", "flights"];

    $scope.marks = []

    $scope.$on("GoogleDriveLoaded", function () {
        $scope.marks = googleDrive.readBookmarks();

        $scope.$digest();
    });

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
        $scope.marks.push(mark);

        $scope.newMark = resetMarker();
    }





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