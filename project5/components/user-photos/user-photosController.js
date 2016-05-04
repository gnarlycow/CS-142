'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = Number($routeParams.userId);
    $scope.user = window.cs142models.userModel(userId);
    $scope.userPhotos = window.cs142models.photoOfUserModel(userId);
    console.log('$scope.userPhotos',$scope.userPhotos);

    console.log('UserPhoto of ', $routeParams.userId);

    console.log('window.cs142models.photoOfUserModel($routeParams.userId)',
       window.cs142models.photoOfUserModel(userId));

  }]);
