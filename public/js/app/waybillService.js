var waybillApp = angular.module("waybillApp", []);

waybillApp.service('WaybillService', function($http, $q){

  //start of saveWaybill
  this.saveWaybill = function(waybillObject, userId){
    if( waybillObject == null || waybillObject == {} ) return null;
    if( userId == null || userId == "" ) return null;
    var invNum = waybillObject.invoiceNumber;
    var wayBill = waybillObject.waybill;
    if( invNum == null || invNum == "" ) return null;
    if( waybill == null || waybill == "") return null;
    var defered = $q.defer();
    var postData = {};
    postData.waybillObject = waybillObject;
    postData.createdBy = userId;
    $http({
      method:"POST",
      url:"/saveWaybill",
      data: postData
    })
    .success(function(data){
      defered.resolve(data);
    })
    .error(function(err){
      defered.reject(err);
    });
    return defered.promise;
  };//end of storeWaybill

});
