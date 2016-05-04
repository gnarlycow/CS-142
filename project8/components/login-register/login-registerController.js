cs142App.controller('LoginRegisterController', ['$scope', '$routeParams', '$resource', '$rootScope','$location',
  function ($scope, $routeParams, $resource, $rootScope, $location) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */

     

    $scope.submit = function() {

      var resource = $resource('/admin/login');
      resource.save({login_name : $scope.ln, password: $scope.pwd}, function(userInfo) {
        if(userInfo.id == undefined) {
          document.getElementById("Error").innerHTML = "Invalid User ID";
        } else {
          $rootScope.user = userInfo;
          $rootScope.loggedIn = true;
          $rootScope.$broadcast('login');
          $location.path('/users/'+userInfo.id);
        }
      }, function(err) {

          // Note: I understand that in most cases you wouldn't want to differentiate incorrect passwords from usernames
          // for security purposes, but I figure since I have this capability, I might as well do it.

          if(err.data === "Incorrect Password") {
            document.getElementById("pwd").style.background = "#ff5f5f";
            document.getElementById("Error").innerHTML = "Incorrect Password";
          } else if(err.data === "Invalid User ID") {
            document.getElementById("ln").style.background = "#ff5f5f";
            document.getElementById("Error").innerHTML = "Invalid User ID";
          } else if(err.data === "An Error Occurred.") {
            document.getElementById("Error").innerHTML = "An Error Occurred.";
          }

      });
    }

    $scope.register = function() {
      var resource = $resource('/user');
      resource.save({
        login_name: $scope.login_name,
        password: $scope.password,
        first_name: $scope.first_name,
        last_name: $scope.last_name,
        occupation: $scope.occupation,
        location: $scope.loc,
        description: $scope.desc

        }, function(user) {
          $rootScope.user = user;
          $rootScope.loggedIn = true;
          $rootScope.$broadcast('login');
          $location.path('/users/'+user.id);
        }, function(err) {

          // Aesthetic error notifications
          if(err.data === "login_name undefined") {

            document.getElementById("RegError").innerHTML = "Username Required";
            document.getElementById("username").style.background = "#ff5f5f";
            document.getElementById("pass").style.background = "white";
            document.getElementById("first").style.background = "white";
            document.getElementById("last").style.background = "white";

          } else if (err.data === "password undefined") {

            document.getElementById("RegError").innerHTML = "Password Required";
            document.getElementById("pass").style.background = "#ff5f5f";
            document.getElementById("username").style.background = "white";
            document.getElementById("first").style.background = "white";
            document.getElementById("last").style.background = "white";

          } else if (err.data === "first_name undefined") {

            document.getElementById("RegError").innerHTML = "First Name Required";
            document.getElementById("first").style.background = "#ff5f5f";
            document.getElementById("pass").style.background = "white";
            document.getElementById("username").style.background = "white";
            document.getElementById("last").style.background = "white";

          } else if (err.data === "last_name undefined") {

            document.getElementById("RegError").innerHTML = "Last Name Required";
            document.getElementById("last").style.background = "#ff5f5f";
            document.getElementById("pass").style.background = "white";
            document.getElementById("first").style.background = "white";
            document.getElementById("username").style.background = "white";

          } else if(err.data === "User Create Error" || err.data === "Database Error") {

            document.getElementById("RegError").innerHTML = "An Error Occurred.";
            document.getElementById("username").style.background = "white";
            document.getElementById("pass").style.background = "white";
            document.getElementById("first").style.background = "white";
            document.getElementById("last").style.background = "white";

          } else if (err.data === "login_name exists") {

            document.getElementById("RegError").innerHTML = "Username Taken";
            document.getElementById("username").style.background = "#ff5f5f";
            document.getElementById("pass").style.background = "white";
            document.getElementById("first").style.background = "white";
            document.getElementById("last").style.background = "white";

          }
        });
    }
  }]);