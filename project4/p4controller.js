"use strict";
cs142App.controller('p4controller', ['$scope', function($scope) {


	$scope.viewNumber = 0;

	$scope.switchView = function() {
		$scope.viewNumber = 1 - $scope.viewNumber;
	};








}]);