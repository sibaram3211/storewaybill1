var UserSchema = require("../UserSchema.js");
var CustomError = require('custom-error-instance');
const errCode = {
  OBJREQUIRE : "OBJREQUIRE",
  UNDEFINEDPARAMETER:"UNDEFINEDPARAMETER",
  DUPLICATEKEY :"DUPLICATEKEY"
};


var getCustomError = function(code){
  if(code == null || code == "") return;
  switch(code){
    case errCode.OBJREQUIRE:
      return CustomError("LOGINHANDLER", {code:"OBJREQUIRE", desc:"Object required"} );
    case errCode.UNDEFINEDPARAMETER:
      return CustomError("LOGINHANDLER",{code:"UNDEFINEDPARAMETER", desc:"parameter is undefined or empty"});
    case errCode.DUPLICATEKEY:
      return CustomError("LOGINHANDLER", {code:"DUPLICATEKEY", desc:"duplicate key"});
    default:
      return null;
  }
};

var getCustomErrObj = function(user){
  var CustomErr = null;
  if(user == undefined || user == null || user == ""){
    CustomErr = getCustomError(errCode.OBJREQUIRE);
    return new CustomErr("User Object require #(userId and  password)");
  }else if(user.userId == undefined || user.userId == null || user.userId == ""){
    CustomErr = getCustomError(errCode.UNDEFINEDPARAMETER);
    return new CustomErr("Userid is missing or empty");
  }else if(user.password == undefined || user.password == null || user.password == ""){
    CustomErr = getCustomError(errCode.UNDEFINEDPARAMETER);
    return new CustomErr("Password is missing or empty");
  }else{
    return null;
  }
};

var addUsers = function(req, res, next){
  var UserModel = UserSchema.User;
  UserModel.create(users, function(err, data){
    if(err){
      next(err);
    }else{
      res.json(data);
    }
  });
};

var login = function(req, res, next){
/*  var sessionUser =  req.session.userName;
  if(sessionUser && sessionUser != ""){
    console.log("session Exist with ::"+ sessionUser);
    return;
  }*/
  var user = req.body.user;
  var UserModel = null;
  var errObj = getCustomErrObj(user);
  if(errObj){
    next(errObj);
    return;
  }
  UserModel = UserSchema.User;
  UserModel.getUserById(user.userId, function(err, userObj){
    if(err) {
      next(err);
      return;
    }
    if(userObj != null){
      userObj.comparePassword(user.password, function(err, isMatch){
        if(err){
          next(err);
          return;
        }
        if(isMatch){
          req.session.userName = user.userId;
        }
        res.json( {'isMatch' : isMatch} );
      });
    }else{
      res.json(null);
    }
  });
}



var users = [
  {
    userId: "it01",
    name:"ITONE",
    password:"ITONE"
  },
  {
    userId: "it02",
    name:"ITTWO",
    password:"ITTWO"
  },
  {
    userId: "sam01",
    name:"SAMONE",
    password:"SAMONE"
  },
  {
    userId: "sam02",
    name:"SAMTWO",
    password:"SAMTWO"
  }];

module.exports.addUsers = addUsers;
module.exports.login = login;
