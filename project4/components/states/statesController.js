"use strict";
/**
 * Define StatesController for the states component of CS142 project #4
 * problem #2.  The model data for this view (the states) is available
 * at window.cs142models.statesModel().
 */

cs142App.controller('StatesController', ['$scope', function($scope) {

   // Replace this with the code for CS142 Project #4, Problem #2
   //console.log('window.cs142models.statesModel()', window.cs142models.statesModel());

   $scope.states = window.cs142models.statesModel();
   $scope.substr = '';

   $scope.validStates = function(sub) {
   		var list = [];
   		var numStates = 0;
   	 	for(var i = 0; i < $scope.states.length ; i++) {
   	 		var st = $scope.states[i];
   	 		if(st.toLowerCase().indexOf(sub.toLowerCase()) !== -1){
   				numStates++;
   				list.push(st);
   			}
   	 	}
   	 	if(numStates === 0) {
   	 		return ["There are no states that match your substring."];
   	 	}
   	 	return list;
   };
}]);
