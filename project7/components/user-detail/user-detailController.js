'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams',
  function ($scope, $routeParams) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    //$scope.user = window.cs142models.userModel(userId);

    $scope.FetchModel('http://localhost:3000/user/' + userId, function(obj) {
        $scope.$apply(function () {
            
            var newObj = JSON.parse(obj);
            $scope.user = newObj;
            /* $scope.user = obj; */
        });
    });



  }]);
