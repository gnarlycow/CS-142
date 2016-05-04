'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource'])

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/login-register',{
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            when('/search/:text', {
                templateUrl: 'components/search/searchTemplate.html',
                controller: 'SearchController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);



cs142App.controller('MainController', ['$scope','$rootScope','$location','$resource','$http',
    function ($scope, $rootScope, $location, $resource, $http) {
        /*
         * FetchModel - Fetch a model from the web server.
         *   url - string - The URL to issue the GET request.
         *   doneCallback - function - called with argument (model) when the
         *                  the GET request is done. The argument model is the object
         *                  containing the model. model is undefined in the error case.
         */

        $scope.logout = function() {
            var resource = $resource('/admin/logout');
            resource.get({}, function() {
                $rootScope.user = null;
                $rootScope.loggedIn = false;
                $location.path("/login-register");
            });
        };

        $scope.searchText = {};

        $scope.doThis = function(text) {
            $location.url("/search/"+text);
        }

        $scope.FetchModel = function(url, doneCallback) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                 //Don’t do anything if not final state
                 if (this.readyState !== 4){ 
                     return; 
                 }
            
                //Final State but status not OK
                if (this.status !== 200) {
                    return;
                }
            
                // Run callback function on response text.
                doneCallback(this.responseText);
            };
            xhr.open("GET", url);
            xhr.send();    
        };

        $rootScope.loggedIn = false;
        $rootScope.uploaded = false;

        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
           if (!$rootScope.loggedIn) {
              // no logged user, redirect to /login-register unless already there
             if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                 $location.path("/login-register");
             }
           } else {
             // If user is logged in, do not let them redirect to login-page before logging out.
             if(next.templateUrl === "components/login-register/login-registerTemplate.html"){
                $location.path("/users/"+$rootScope.user.id);
             }
           }
        });

        $scope.main = {};
        $scope.main.title = "CS 142, Project 8"

        $scope.FetchModel('http://localhost:3000/test/info', function(obj) {
            $scope.$apply(function () {
                $scope.version = JSON.parse(obj).version;
            });
        });


        var selectedPhotoFile;   // Holds the last file selected by the user

        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.inputFileNameChanged = function (element) {
            selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.inputFileNameSelected = function () {
            return !!selectedPhotoFile;
        };

        // Upload the photo file selected by the user using a post request to the URL /photos/new
        $scope.uploadPhoto = function () {
            if (!$scope.inputFileNameSelected()) {
                console.error("uploadPhoto called will no selected file");
                return;
            }

            var perms = prompt("Who can see this photo? Separate names with commas or leave blank to include everyone.");
            // If the user presses cancel, stop the upload process.
            if(perms === null) {
                return;
            }
            var names = perms.split(",").map(Function.prototype.call, String.prototype.trim);
            names = names.filter(function(str) {
                return str.match(/[A-Za-z]+ [A-Za-z]+/);
            });
            console.log(names);

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', selectedPhotoFile);
            domForm.append('vis_perms',names);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).success(function(newPhoto){
                var str = "/photos/" + $rootScope.user.id + "\#" + newPhoto.id;
                $location.url(str);
                $rootScope.$broadcast('render');
                console.log("Photo uploaded successfully!");
            }).error(function(err){
                console.error('ERROR uploading photo', err);
            });
        };


    }]);




 
