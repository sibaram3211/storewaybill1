var WaybillModel = require("../WaybillSchema.js");
var CustomError = require('custom-error-instance');
var XLSX = require('xlsx');
var Worksheet = require('xlsx-workbook').Worksheet;


var department = 02;
const errCode = {
    OBJREQUIRE: "OBJREQUIRE",
    UNDEFINEDPARAMETER: "UNDEFINEDPARAMETER",
    DUPLICATEKEY: "DUPPLICATEKEY",
    NOTSUPPORT: "NOTSUPPORT"
}
const departments = ["02", "03"];

var getCustomError = function(code){
  if(code == null || code == "") return;
  switch(code){
    case errCode.OBJREQUIRE:
      return CustomError("WAYBILLHANDLERERR", {code:"OBJREQUIRE", desc:"Object require"});
    case errCode.UNDEFINEDPARAMETER:
      return CustomError("WAYBILLHANDLERERR", {code:"UNDEFINEDPARAMETER", desc:"Parameter undefined OR null"});
    case errCode.DUPLICATEKEY:
      return CustomError("WAYBILLHANDLERERR", {code:"DUPPLICATEKEY", desc:"The key already exist"});
    case errCode.NOTSUPPORT:
      return CustomError("WAYBILLHANDLERERR", {code:"NOTSUPPORT", desc:" NOT Supports"});
    default :
      return null;
  }
};

//getWaybillByInvoice, gets waybill object by invoiceNumber
var getWaybillByInvoice = function(req, res, next){
  var invoiceNumber = req.query.invoiceNumber;
  var cust_branch = req.query.cust_branch;
  var errObj = null;
  var CustErr = null;
  if(invoiceNumber == undefined || invoiceNumber == null || invoiceNumber == ""){
    CustErr = getCustomError(errCode.UNDEFINEDPARAMETER);
    errObj = new CustErr("Invoice Number is undefined or empty");
  }else if(cust_branch == undefined || cust_branch == null || cust_branch == ""){
    CustErr = getCustomError(errCode.UNDEFINEDPARAMETER);
    errObj = new CustErr("Customer branch is undefined or Empty");
  }
  if(errObj){
    next(errObj);
    return;
  }
  WaybillModel.getWaybillByInvoice(cust_branch, invoiceNumber, function(err, data){
    if(err){
      next(err);
      return;
    }else{
      res.json(data);
    }
  });
};//end of getWaybillByInvoice method

//removeWaybill removes Waybill
 var removeWaybill = function(req, res, next){
   var waybill = req.body.waybill;
   var errorObj = getWaybillCustErrObject(waybill);
   if(errorObj){
     next(errorObj);
     return;
   }
   //waybill._id = null;
   if(waybill._id == undefined || waybill._id == null || waybill._id == ""){
     var CustErr = getCustomError(errCode.UNDEFINEDPARAMETER);
     errorObj = new CustErr("_id is undefined or empty");
   }
   if(errorObj){
     next(errorObj);
     return;
   }
  WaybillModel.getWaybill(waybill._id, function(err, returnedWaybill){
    if(err){
      next(err);
      return;
    }
    returnedWaybill.remove(function(err){
      if(!err) res.json(waybill);
    });
  });
 }//removeWaybill ends

/* getWaybillCustErrObject  returns custom Err */
var getWaybillCustErrObject = function(waybill){
  var errorObj = null;
  var CustErr = null;
  if(waybill ==  undefined || waybill == null || waybill == {}){
    CustErr = getCustomError(errCode.OBJREQUIRE);
    errorObj = new CustErr("waybill Object require");
  }else if(waybill && (waybill.cust_branch == undefined || waybill.cust_branch == null || waybill.cust_branch == "")){
    CustErr = getCustomError(errCode.UNDEFINEDPARAMETER);
    errorObj = new CustErr("customer branch code is undefined or empty");
  }else if(waybill && (waybill.invoiceNumber == undefined || waybill.invoiceNumber == null || waybill.invoiceNumber == "")){
    CustErr = getCustomError(errCode.UNDEFINEDPARAMETER);
    errorObj = new CustErr("invoiceNumber is undefined or empty");
  }else if( departments.indexOf(waybill.invoiceNumber.substring(0,2)) == -1 ){
    CustErr = getCustomError(errCode.NOTSUPPORT);
    errorObj = new CustErr("No service for this Branch :"+ waybill.invoiceNumber.substring(0,2) );
  }else if(waybill && (waybill.waybillNumber == undefined || waybill.waybillNumber == null || waybill.waybillNumber == "") ){
    CustErr = getCustomError(errCode.UNDEFINEDPARAMETER);
    errorObj = new CustErr("waybillNumber is undefined or empty");
  }else{
    errorObj = null;
  }
  return errorObj;
}//end of getWaybillCustErrObject

/*updateWaybill  updates*/
var updateWaybill = function(req, res, next){
  var waybill = req.body.waybill;
  var errorObj = getWaybillCustErrObject(waybill);
  if(errorObj){
    next(errorObj);
    return;
  }
  if(waybill._id == undefined || waybill._id == null || waybill._id == ""){
    var CustErr = getWaybillCustErrObject(errCode.UNDEFINEDPARAMETER);
    errorObj = new CustErr("_id Field is undefined or empty");
    next(errorObj);
    return;
  }else if(waybill.department == undefined || waybill.department == null || waybill.department == ""){
    var CustErr = getWaybillCustErrObject(errCode.UNDEFINEDPARAMETER);
    errorObj = new CustErr("Department field is Required !!");
    next(errorObj);
    return;
  }
  WaybillModel.getWaybill(waybill._id, function(err, existingWaybill){
    if(err){
      next(err);
      return;
    }else{
      existingWaybill.cust_branch = waybill.cust_branch;
      existingWaybill.invoiceNumber = waybill.invoiceNumber;
      existingWaybill.waybillNumber = waybill.waybillNumber;
      existingWaybill.department = waybill.invoiceNumber.substring(0,2);
      existingWaybill.remark = waybill.remark;
      existingWaybill.updateDateTime = new Date();
      existingWaybill.save(function(err, data){
        if(err){
          next(err);
          return;
        }
        res.json(data)
      });
    }
  });
}//updateWaybill ends

/*stores new waybill entry*/
var saveWaybill = function(req, res, next){
  var waybill = req.body;
  //var waybill  = undefined;
  var errorObj = getWaybillCustErrObject(waybill);
  if(errorObj){
    next(errorObj);
    return;
  }
  waybill.createdBy = "admin";
  WaybillModel.getWaybillByInvoice(waybill.cust_branch, waybill.invoiceNumber, function(err, data){
      if(err) next(err);
      if( data != null && data != {} ){
        CustErr = getCustomError(errCode.DUPLICATEKEY);
        errorObj = new CustErr("Invoice Number already exist: " + waybill.invoiceNumber);
        res.json({"duplicateKey":true, "desc":"Invoice number exists"});
        next(errorObj);
        return;
      }else{
        var waybillModel = new WaybillModel(waybill)
        waybillModel.department = waybillModel.invoiceNumber.substring(0,2);
        waybillModel.save(function(err, data){
          if(err) next(err);
          res.json(data);
        });
      }
  });
};

//getWaybillsByCriteria, gets waybills by given criteria
var getWaybillsByCriteria = function(req, res, next){
  var criteria = req.body.criteria;
  var dept = req.body.dept;
  const DAYSTARTHOUR = 0;
  const DAYSTARTMINUTE = 0;
  const DAYSTARTSECOND = 0;
  const DAYSTARTMILISECOND = 0;
  const DAYENDHOUR = 23;
  const DAYENDMINUTE = 59;
  const DAYENDSECOND = 59;
  const DAYENDMILISECOND = 0;
  var start = new Date();
  var end = new Date();
  var condition = null;
  if(criteria == "TD"){
    start.setHours(DAYSTARTHOUR, DAYSTARTMINUTE, DAYSTARTSECOND, DAYSTARTMILISECOND);
    end.setHours(DAYENDHOUR, DAYENDMINUTE, DAYENDSECOND, DAYENDMILISECOND);
    condition = {$gte: start, $lte: end};
  }else if(criteria == "YD"){
    var day = start.getDate();
    start.setDate(--day);
    end.setDate(day);
    start.setHours(DAYSTARTHOUR, DAYSTARTMINUTE, DAYSTARTSECOND, DAYSTARTMILISECOND);
    end.setHours(DAYENDHOUR, DAYENDMINUTE, DAYENDSECOND, DAYENDMILISECOND);
    condition = {$gte: start, $lte: end};
  }else if(criteria == "BYD"){
    var day = start.getDate();
    end.setDate(--day);
    end.setHours(DAYSTARTHOUR, DAYSTARTMINUTE, DAYSTARTSECOND, DAYSTARTMILISECOND);
    condition = {$lte: end};
  }else{
    condition = {$gte: start};
  }//if ends
  WaybillModel.find( {"createdDateTime":condition, "department" : dept}, function(err, data){
    if(err){
      next(err);
      return;
    }else{
      res.json(data);
    }
  });
};//getWaybillsByCriteria ends


//downloadXlsxFile  starts
var downloadXlsxFile = function(req, res, next){
  var criteria = req.query.criteria;
  var dept = req.query.dept;
  console.log("criteria ::" + JSON.stringify(req.query) );
  const DAYSTARTHOUR = 0;
  const DAYSTARTMINUTE = 0;
  const DAYSTARTSECOND = 0;
  const DAYSTARTMILISECOND = 0;
  const DAYENDHOUR = 23;
  const DAYENDMINUTE = 59;
  const DAYENDSECOND = 59;
  const DAYENDMILISECOND = 0;
  var start = new Date();
  var end = new Date();
  var condition = null;
  if(criteria == "TD"){
    start.setHours(DAYSTARTHOUR, DAYSTARTMINUTE, DAYSTARTSECOND, DAYSTARTMILISECOND);
    end.setHours(DAYENDHOUR, DAYENDMINUTE, DAYENDSECOND, DAYENDMILISECOND);
    condition = {$gte: start, $lte: end};
  }else if(criteria == "YD"){
    var day = start.getDate();
    start.setDate(--day);
    end.setDate(day);
    start.setHours(DAYSTARTHOUR, DAYSTARTMINUTE, DAYSTARTSECOND, DAYSTARTMILISECOND);
    end.setHours(DAYENDHOUR, DAYENDMINUTE, DAYENDSECOND, DAYENDMILISECOND);
    condition = {$gte: start, $lte: end};
  }else if(criteria == "BYD"){
    var day = start.getDate();
    end.setDate(--day);
    end.setHours(DAYSTARTHOUR, DAYSTARTMINUTE, DAYSTARTSECOND, DAYSTARTMILISECOND);
    condition = {$lte: end};
  }else{
    condition = {$gte: start};
  }//if ends
  WaybillModel.find( {"createdDateTime":condition, "department" : dept}, function(err, data){
    if(err){
      next(err);
      return;
    }else{
      var worksheet = new Worksheet("waybills");
      //worksheet = XLSX.utils.json_to_sheet(data);
      worksheet[0][0] = "Invoice Number";
      worksheet[0][1] = "Waybill Number";
      worksheet[0][2] = "Remark";
      for(var i=0; i<data.length; i++){
          var row = i+1;
          console.log(JSON.stringify(data[i]));
          worksheet[row][0] = data[i].cust_branch+''+data[i].invoiceNumber;
          worksheet[row][1] = data[i].waybillNumber;
          worksheet[row][2] = data[i].remark;
      }
      var workbook = worksheet.save("hello1.xlsx");
      res.download("hello1.xlsx");
      //console.log("nkjnskjfn");
      console.log("workbook property :" + JSON.stringify(workbook.Props) );
      //res.pipe(workbook);
      //res.json(data);
    }
  });
};//downloadXlsxFile function ends




module.exports.saveWaybill = saveWaybill;
module.exports.getWaybillByInvoice = getWaybillByInvoice;
module.exports.updateWaybill = updateWaybill;
module.exports.removeWaybill= removeWaybill;
module.exports.getWaybillsByCriteria = getWaybillsByCriteria;
module.exports.downloadXlsxFile = downloadXlsxFile;
