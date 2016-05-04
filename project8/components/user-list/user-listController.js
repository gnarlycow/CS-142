'use strict';


cs142App.controller('UserListController', ['$scope','$rootScope',
    function ($scope, $rootScope) {

        $rootScope.$on('login', function(event, next, current) {
        	$scope.main.title = 'Users';
        	$scope.FetchModel('http://localhost:3000/user/list', function(obj) {
        	    $scope.$apply(function () {
        	    	var newObj = JSON.parse(obj);
        	        $scope.userList = newObj;
        	    });
        	});
    	});
    }]);


