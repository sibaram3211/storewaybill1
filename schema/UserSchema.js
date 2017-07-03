var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  userId : {type: String, required: true},
  name:{type:String, required: true},
  password :{type: String, required: true},
  createdDateTime :{type:Date, default: new Date()},
  updateDateTime:{type:Date}
});


UserSchema.pre('save', function(next){
  var user = this;
  if(!user.isModified('password') )  return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
    if(err) return ext(err);
    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(enteredPassword, cb){
  bcrypt.compare(enteredPassword, this.password, function(err, isMatch){
    if(err){
      cb(err, null);
    }else{
      cb(null, isMatch);
    }
  });
};

UserSchema.statics.getUserById = function(userId, cb){
  this.findOne({'userId': userId}, cb);
}

module.exports.User = mongoose.model("User", UserSchema);
