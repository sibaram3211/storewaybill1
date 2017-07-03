var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WaybillSchema = new Schema({
  invoiceNumber : {type:String, required:true, index: true },
  cust_branch:{type:String, required :true },
  waybillNumber: {type:Number, required: true},
  remark: {type:String},
  department: {type:String, required:true},
  createdBy: {type:String, required:true},
  createdDateTime: {type:Date, default: new Date()},
  updateDateTime: {type:Date, default: new Date()}
});

WaybillSchema.statics.getWaybill = function(waybill_id, callback){
  var waybillId = mongoose.Types.ObjectId(waybill_id);
  this.findOne( {_id : waybillId}, callback);
};

WaybillSchema.statics.getWaybillByInvoice = function(cust_branch, invNumber, callback){
  this.findOne( {'cust_branch':cust_branch, 'invoiceNumber':invNumber}, callback );
}

module.exports = mongoose.model("Waybill", WaybillSchema);
