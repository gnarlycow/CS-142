'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams','$resource', '$rootScope',
  function($scope, $routeParams, $resource, $rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    $scope.uid = $rootScope.user.id;

    $scope.addComment = function() {
        if($scope.com != undefined && $scope.com != null && $scope.com.length !== 0) {
            var resource = $resource('/commentsOfPhoto/' + $scope.photo.id);
            resource.save({comment : $scope.com}, function(){
                $rootScope.$broadcast('render');
            });
        }
        window.location.hash = "/photos/" + userId;
        var elem = document.getElementById($scope.photo.id);
        elem.scrollIntoView(false);
    };

    $scope.Like = function() {
        window.location.hash = "/photos/" + userId + "#" + $scope.photo.id;
        var resource = $resource('/like/' + $scope.photo.id);
        resource.save({}, function() {
            $rootScope.$broadcast('render');
        });
    };

    $scope.plural = function(count) {
        if(count !== 1) { return "Likes"; }
        else {return "Like"; }
    };

/*
    $scope.FetchModel('http://localhost:3000/user/list', function(obj) {
        $scope.$apply(function () {
            var newObj = JSON.parse(obj);
            $scope.userList = newObj;
        });
    });
*/
    $scope.deletablePhoto = function(item) {
        if(!$rootScope.loggedIn || $rootScope.user == undefined || $rootScope.user == null) { return false; }
        if($rootScope.user.id === item.user_id ) { return true; }
        return false;
    };

    $scope.deletableComment = function(item) {
        if(!$rootScope.loggedIn || $rootScope.user == undefined || $rootScope.user == null) { return false; }
        if($rootScope.user.id === item.user.id ) { return true; }
        return false;
    };

    $scope.deletePhoto = function(photo) {
        window.location.hash = "/photos/" + userId;
        var resource = $resource('/deletePhoto/' + photo.id);
        resource.save({}, function() {
            $rootScope.$broadcast('render');
        });
    };

    $scope.deleteComment = function(photo, comment) {
        var resource = $resource('/deleteComment/' + photo.id);
        resource.save({comment: comment}, function() {
            $rootScope.$broadcast('render');
        });
        window.location.hash = "/photos/" + userId + "#" + photo.id;
    };

    $scope.FetchModel('http://localhost:3000/user/' + userId, function(obj) {
        $scope.$apply(function () {
            var newObj = JSON.parse(obj);
            $scope.user = newObj;
        });
    });

    $scope.FetchModel('http://localhost:3000/photosOfUser/' + userId, function(obj) {
        $scope.$apply(function () {
            var newObj = JSON.parse(obj);
            $scope.userPhotos = newObj;
            var str = window.location.hash.substring(1);
            if(str.indexOf("\#") !== -1) {
                str = str.substring(str.indexOf("\#")+1);
                var elem = document.getElementById(str);
                if(elem != null) {
                    elem.scrollIntoView(true);
                }
            }
        });
    });


    $rootScope.$on('render', function() {
        $scope.FetchModel('http://localhost:3000/photosOfUser/' + userId, function(obj) {
            $scope.$apply(function () {
                var newObj = JSON.parse(obj);
                $scope.userPhotos = newObj;
                var str = window.location.hash.substring(1);
                if(str.indexOf("\#") !== -1) {
                    str = str.substring(str.indexOf("\#")+1);
                    var elem = document.getElementById(str);
                    if(elem != null) {
                        elem.scrollIntoView(true);
                    }
                }
            });
        });
    });
  }]);