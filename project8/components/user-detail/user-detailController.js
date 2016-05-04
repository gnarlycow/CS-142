'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$rootScope', '$resource', '$location',
  function ($scope, $routeParams, $rootScope, $resource, $location) {
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
        });
    });

    $scope.FetchModel('/latest/'+userId, function(obj) {
      $scope.$apply(function() {
        if(obj.length === 0) {
          $scope.latest = null;
        } else {
          var newphot = JSON.parse(obj);
          $scope.latest = newphot;
        }
      });
    });

    $scope.FetchModel('/popular/'+userId, function(obj) {
      $scope.$apply(function() {
        if(obj.length === 0) {
          $scope.popular = null;
        } else {
          var popphot = JSON.parse(obj);
          $scope.popular = popphot;
        }
      })
    });

    $scope.plural = function(count) {
        if(count !== 1) { return "Comments"; }
        else {return "Comment"; }
    };

    $scope.deletable = function() {
      if($rootScope.user === null) { return false; }
      if($rootScope.user.id === userId) { return true; }
      return false;
    }

    $scope.deleteUser = function() {
      var confirmation = prompt("Please confirm that you would like to delete your account by typing \"Confirm\". (Case is sensitive).");
      if(confirmation === null) { return; }
      if(confirmation !== "Confirm") { return; }
      var resource = $resource("/delete/"+userId);
      resource.save(function() {
        $rootScope.user = null;
        $rootScope.loggedIn = false;
        $location.path("/login-register");
      });
    }


  }]);
