var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sampleCollSchema = new Schema({
  "Name":{type:String, default:"Hello!!"}
});

 module.exports = mongoose('sampleColl', sampleCollSchema)
