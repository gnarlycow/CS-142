'use strict';

cs142App.controller('SearchController', ['$scope', '$routeParams',
  function ($scope, $routeParams) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    $scope.param = $routeParams.text;
    //$scope.user = window.cs142models.userModel(userId);

    $scope.FetchModel('/photosearch/'+$scope.param, function(obj) {
        $scope.$apply(function() {
            var newObj = JSON.parse(obj);
            $scope.photoList = newObj;
        });
    });

    $scope.contains = function(text) {
      if(text.toLowerCase().indexOf($scope.param.toLowerCase()) !== -1) { return true; }
      return false;
    };

  }]);
