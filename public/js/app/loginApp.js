var loginApp = angular.module("loginApp", []);

loginApp.service("LoginService", function($q, $http){

  this.addUsers = function(){
    var defered = $q.defer();
    $http({
      method:"post",
      url:"/addUsers",
      data:{}
    })
    .success(function(data){
      defered.resolve(data);
    })
    .error(function(err){
      console.log("Err ::" + JSON.stringify(err) );
      defered.reject(err);
    })
    return defered.promise;
  };//end of endUsers function

  this.doLogin = function(user){
    if(user == undefined || user == null) return;
    var defered = $q.defer();
    $http({
      method: "post",
      url: "/doLogin",
      data:{'user': user}
    })
    .success(function(data){
      defered.resolve(data);
    })
    .error(function(err){
      defered.reject(err);
    })
    return defered.promise;
  }//end of doLogin

});

loginApp.controller("headerController", function($scope){
  $scope.userName = null;
  $scope.isSession = false;
  $scope.showUserMenu  = false;
  $scope.labels = headerLabels;
  $scope.showMenu = function(){
    $scope.showUserMenu = true;
  };
  $scope.closeMenu = function(){
    $scope.showUserMenu = false;
  };

});

loginApp.controller("loginController", function($scope, LoginService, $window){
  $scope.user = {
    userId : "",
    password : ""
  }

  $scope.addUsers = function(){
    console.log("Add Users");
    var promise = LoginService.addUsers();
    promise.then(
      function(data){
        console.log("Users Are : >>"+ JSON.stringify(data) );
      },function(err){
        console.log("Error in adding Users :"+ JSON.stringify(err) );
    });
  };

  $scope.login = function(){
    var promise = LoginService.doLogin($scope.user);
    promise.then(
      function(data){
        if(data == null){
          alert("UserName is not correct");
        }else if(data.isMatch){
          $window.location.href = '/waybill';
        }else{
          alert("Password is not correct");
        }
      },
      function(err){
        console.log("Login Err :"+ JSON.stringify(err) );
    });
  };

});
