'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams','$resource', '$rootScope',
  function($scope, $routeParams, $resource, $rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;

    $scope.addComment = function() {

        var resource = $resource('/commentsOfPhoto/' + $scope.photo.id);
        resource.save({comment : $scope.com}, function(){
            $rootScope.$broadcast('render');
        });
    }

/*
    $scope.FetchModel('http://localhost:3000/user/list', function(obj) {
        $scope.$apply(function () {
            var newObj = JSON.parse(obj);
            $scope.userList = newObj;
        });
    });
*/


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
        });
    });


    $rootScope.$on('render', function() {
        $scope.FetchModel('http://localhost:3000/photosOfUser/' + userId, function(obj) {
            $scope.$apply(function () {
                var newObj = JSON.parse(obj);
                $scope.userPhotos = newObj;
            });
        });
    });
  }]);