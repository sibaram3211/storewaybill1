var mongoose = require('mongoose');
//var dbURL = "mongodb://sibaram:206022@ds111922.mlab.com:11922/demo";
var dbURL = "mongodb://127.0.0.1:27017/demo1"
mongoose.connect(dbURL);

mongoose.connection.on('connected', function(){
  console.log("mongoose default Connection");
});

mongoose.connection.on('error', function(err){
  console.log("mongoose default Connection Error :"+ JSON.stringify(err) );
});

mongoose.connection.on('reconnected', function(){
  console.log("mongodb reconnected");
});

mongoose.connection.on('disconnected', function(){
  console.log("mongodb disconnected");
});

module.exports = mongoose.connection;
