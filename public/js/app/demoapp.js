var myapp = angular.module("demoApp", []);
myapp.service("UtilityService", function($http, $q){

  //this.labels = labels
  /* checkInvoice starts here*/
  this.checkInvoice = function(e, invoiceNumber){
    if(invoiceNumber == undefined || invoiceNumber == null || invoiceNumber == "")
      return;
    var isAllowable = true;
    var allowedSpecialKeys = [8, 9, 13, 27, 46, 37, 39];
    //var numKeys = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
    //var numKeyboardKeys = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
    var charCode = e.charCode? e.charCode : e.which;
    if(e.shiftKey) e.preventDefault();
    if(allowedSpecialKeys.indexOf(charCode) === -1){
      if(invoiceNumber.length <= 8){
        if((charCode < 48  && charCode > 57) || (charCode > 57  &&  charCode < 96) || (charCode < 96 && charCode > 105))
          e.preventDefault();
      }else{
          e.preventDefault();
      }
    }
  };//chekcInvoice ends here

  /* foramt invoice starts here*/
  this.getFormatedInvoice = function(invoiceNumber){
    console.log("invoiceNumber length: "+invoiceNumber.length);
    if(invoiceNumber.length != 9 ) return invoiceNumber;
    var branch = invoiceNumber.substring(0,2);
    var invoice  = invoiceNumber.substring(2,9);
    var formatedInvoice = branch + "-" + invoice;
    console.log("formatted Invoice: "+ formatedInvoice);
    return formatedInvoice;
  }/*formatInvoice ends*/

  this.getPlainInvoice = function(invoiceNumber){
    if(invoiceNumber.indexOf("-") != 2) return invoiceNumber;
    if(invoiceNumber.length != 10 ) return invoiceNumber;
    var invoiceParts = invoiceNumber.split("-");
    var invoice = invoiceParts[0] + invoiceParts[1];
    return invoice;
  }

  //waybillNumber : --36170615012345
  this.isValidWaybillNum = function(waybillNumber){
    const TNCode = 36;
    console.log("kndkf :"+waybillNumber);
    console.log(waybillNumber.length );
    if(isNaN(waybillNumber))  return false;
    if(waybillNumber.length != 15) return false;
    var regionCode = waybillNumber.substr(0, 2);
    if(regionCode != TNCode) return false;
    return true;
  };

  this.getWaybillCreateDate = function(waybillNumber){
    var dateStr = waybillNumber.substr(2,6);
    var month = dateStr.substr(2,2) - 1;
    var waybillCreateDate = new Date("20"+dateStr.substr(0,2), month, dateStr.substr(4,6));
    return waybillCreateDate;
  };
});
myapp.service("WaybillService", function($http, $q){
  //saveWaybill starts here
  this.waybills = [];
  this.departments = ['02', '03'];
  var that = this;

  this.getUserSession = function(){
    var defered = $q.defer();
    $http({
      method: "GET",
      url:"/getUserSession"
    }).
    success(function(data){
      defered.resolve(data);
    }).
    error(function(err){
      defered.reject(err);
    });
    return defered.promise;
  };

  this.saveWaybill = function(waybill){
    if( waybill == undefined ) return;
    if( waybill == null || waybill == {} ) return;
    var invoiceNumber = waybill.invoiceNumber;
    var temp = invoiceNumber.split("-");
    waybill.cust_branch = temp[0];
    waybill.invoiceNumber = temp[1];
    var defered = $q.defer();
    var branchCode = waybill.invoiceNumber.substring(0, 2);
    if( this.departments.indexOf(branchCode) == -1 ){
      alert("No such branch code exists :" + branchCode );
      defered.reject( {'err': "No such branch code exists", 'branchCode': branchCode } );
      return defered.promise;
    }
    $http({
      method:"POST",
      url:"/saveWaybill",
      data: waybill
    })
    .success(function(data){
      defered.resolve(data);
    })
    .error(function(err){
      defered.reject(err);
    });
    return defered.promise;
  }//saveWaybill ends here

  //getWaybillsByCriteria starts
  this.getWaybillsByCriteria = function(dept, criteria){
    const criterias = ["TD", "YD", "BYD"];
    const departments = ["02", "03"];
    if(criteria == null || criteria == "") return;
    if(criterias.indexOf(criteria) == -1 || departments.indexOf(dept) == -1 ) return;
    var defered = $q.defer();
    $http({
      method:"post",
      url:"/getWaybillsByCriteria",
      data: {'criteria': criteria, 'dept': dept}
    })
    .success(function(data){
      that.waybills = null;
      that.waybills = data;
      defered.resolve(that.waybills);
    })
    .error(function(err){
      defered.reject(err);
    });
    return defered.promise;
  }//getWaybillsByCriteria ends

  //getWaybillsByCriteria starts
  this.downloadXlsxFile = function(dept, criteria){
    const criterias = ["TD", "YD", "BYD"];
    const departments = ["02", "03"];
    if(criteria == null || criteria == "") return;
    if(criterias.indexOf(criteria) == -1 || departments.indexOf(dept) == -1 ) return;
    var defered = $q.defer();
    $http({
      method:"get",
      url:"/downloadXlsxFile",
      dataType : "binary",
      processData : false,
      responseType : 'arraybuffer',
      params: {'criteria': criteria, 'dept': dept}
    })
    .success(function(data){
      defered.resolve(data);
    })
    .error(function(err){
      defered.reject(err);
    });
    return defered.promise;
  }//getWaybillsByCriteria ends



  //getWaybill returns waybills Object by waybillID
  var getWaybill = function(waybillID){
    if(that.waybills && that.waybills.length == 0) return;
    for(var i=0; i<that.waybills.length; i++){
      if(that.waybills[i]._id == waybillID){
        return that.waybills[i];
      }
    }
    return null;
  }//end of getWaybill

  //getWaybill returns waybills Object by waybillID
  var getWaybillIndex = function(waybillID){
    if(that.waybills == null || that.waybills.length == 0) return -1;
    for(var i=0; i<that.waybills.length; i++){
      if(that.waybills[i]._id == waybillID){
        return i;
      }
    }
    return -1;
  }//end of getWaybill

/* updateWaybillcall updates wabilll*/
  this.updateWaybill = function(waybill){
    var defered = $q.defer();
    $http({
      method: "post",
      url: "/updateWaybill",
      data: {'waybill' : waybill}
    })
    .success(function(data){
      defered.resolve(data);
    })
    .error(function(error){
      console.log("Error ::"+ JSON.stringify(error));
      defered.reject(error);
    });
    return defered.promise;
  };//end of updateWaybillCall

  this.update = function(waybill){
    if(this.waybills && this.waybills.length == 0) return;
    if(waybill == null || waybill == {}) return;
    var oldWaybill = getWaybill(waybill._id);
    if (waybill == null )  return;
    oldWaybill = waybill;
  }//updateWaybill ends

  /*removeWaybill removes waybill*/
  this.removeWaybill = function(waybill){
    var defered = $q.defer();
    $http({
      method:"post",
      url:"/removeWaybill",
      data:{'waybill' : waybill}
    })
    .success(function(data){
      defered.resolve(data);
    })
    .error(function(err){
      defered.reject(err);
    });
    return defered.promise;
  }//end of removeWaybill

  //remove removes waybill from this.waybills
  this.remove = function(waybill){
    if(waybill  == null || waybill == {}) return -1;
    if(this.waybills == null || this.waybills.length == 0) return -1;
    var index = getWaybillIndex(waybill._id)
    if(index == -1) return -1;
    this.waybills.splice(index, 1);
    return index;
  }//end of remove

//getWaybillByInvoice returns waybill object by invoiceNumber
  this.getWaybillByInvoice = function(cust_branch, invoiceNumber){
    var defered = $q.defer();
    $http({
      method:"get",
      url:"/getWaybillByInvoice",
      params: {'invoiceNumber' : invoiceNumber, 'cust_branch' : cust_branch}
    })
    .success(function(data){
      if(data == null || data == {} ){
        that.waybills = null;
      }else{
        that.waybills = [];
        that.waybills.push(data);
      }
      console.log(JSON.stringify(that.waybills));
      defered.resolve(that.waybills);
    })
    .error(function(err){
      defered.reject(err);
    });
    return defered.promise;
  };// end of getWaybillByInvoice
});
myapp.controller("mainController", function($scope){

});
myapp.controller("headerController", function($scope, $window, WaybillService){
  var promise = WaybillService.getUserSession();
  promise.then(
    function(data){
      if(data && data.userName){
        $scope.userName = data.userName;
        $scope.isSession = true;
      }
    },
    function(err){
      console.log("ERR @ SESSIONHANDLER :" + JSON.stringify(err) );
    }
  );
  $scope.labels = headerLabels;
  console.log("header Labels :"+ JSON.stringify($scope.labels) );
  $scope.showUserMenu  = false;
  $scope.showMenu = function(){
    $scope.showUserMenu = true;
  };
  $scope.closeMenu = function(){
    $scope.showUserMenu = false;
  };
  $scope.signout = function(){
    $window.location.href = "/dosignout";
  };
});

myapp.controller("xController", function($scope, WaybillService, UtilityService){
  $scope.waybills = null;
  $scope.isDownload = false;
  const waybillListTemp = "views/waybillList.html"
  const noTemplate = "";
  $scope.waybillsTemp = "";
  $scope.searchCriteria = {
    "opt":"",
    "dept":""
  };

  $scope.downloadXlsx = function(){
    var criteria = $scope.searchCriteria.opt;
    var dept = $scope.searchCriteria.dept;
    var promise = WaybillService.downloadXlsxFile(dept, criteria);
    promise.then(
      function(data){
        var b = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
        var url = window.url || window.webkitURL;
        var fileURL = url.createObjectURL(b);
        var downloadLink = document.createElement("a");
        downloadLink.href = fileURL;
        downloadLink.download =  "waybill.xlsx";
        downloadLink.target = "_blank";
        downloadLink.click();
      },
      function(err){
        console.log("Error ::>>"+ JSON.stringify(err));
    });
  };

  //getting waybill by invoice number
  $scope.getWaybillByInvoice = function(){
    var invoice = $scope.invNumber;
    if(invoice == null || invoice == "") return;
    var branch = null;
    var invNum = null;
    if( invoice.length == 9 ){
      branch = invoice.substring(0,2);
      invNum = invoice.substring(2);
      console.log("Branch ::>> " + branch);
      console.log("invNum ::>> " + invNum);
    }else{
      alert("Invoice Nunber is too short or too Long ! #require Length 9");
      return;
    }
    var promise = WaybillService.getWaybillByInvoice(branch, invNum);
    promise.then(
      function(data){
        $scope.isDownload = false;
        if(data != null && data != []){
          $scope.waybills = [];
          data.isEditing = false;
          $scope.waybills = data;
          $scope.waybillsTemp = waybillListTemp;
        }else{
          $scope.waybills = null;
          $scope.waybillsTemp = noTemplate;
        }
    },
    function(err){
      console.log("ERROR :"+JSON.stringify(err));
    });
  };//end of getWaybillByInvoice method

  //getWaybillsByCriteria gets waybills by criteria user selected
  $scope.getWaybillsByCriteria = function(){
    var criteria = $scope.searchCriteria.opt;
    var dept = $scope.searchCriteria.dept;
    var promise = WaybillService.getWaybillsByCriteria(dept, criteria);
    promise.then(
      function(data){
        if(data != null && data.length > 0){
          $scope.waybills = null;
          $scope.waybills = [];
          $scope.waybills = data;
          $scope.isDownload = true;
          $scope.waybillsTemp = waybillListTemp;
        }else{
          $scope.isDownload = false;
          $scope.waybills = null;
          $scope.waybillsTemp = noTemplate;
        }
      },
      function(err){
        console.log("returend Err : "+ JSON.stringify(err) );
    });
  }//getWaybillsByCriteria ends

  $scope.onEdit = function(waybill){
    waybill.edit = null;
    waybill.edit = angular.copy(waybill);
    waybill.edit.isValidInvoice = true;
    waybill.edit.isValidWaybill = true;
    waybill.edit.fullInvoice = waybill.cust_branch+waybill.invoiceNumber;
    //casting waybillNumber to String as it is number
    waybill.edit.waybillNumber = ""+waybill.waybillNumber;
    waybill.isEditing = true;
    waybill.edit.fullInvoice = UtilityService.getFormatedInvoice(waybill.edit.fullInvoice);
  };

  /* removes a Waybill*/
  $scope.remove = function(waybill){
    var promise = WaybillService.removeWaybill(waybill);
    promise.then(
      function(data){
        var index = WaybillService.remove(data);
        if($scope.waybills.length == 0){
          $scope.waybillsTemp  = noTemplate;
        }
      },
      function(err){
          console.log("Error is :"+ JSON.stringify(err) );
      });
  };//remove function ends

  $scope.onCancel = function(waybill){
    waybill.isEditing = false;
  };

  $scope.getInvalidClass = function(waybill, param){
    if(waybill.edit == undefined || waybill.edit == null) return;
    if(param == "invoice"){
        if(!waybill.edit.isValidInvoice)
          return "inputErr";
        else
          return null;
    }
    if(param == "waybill"){
      if( !waybill.edit.isValidWaybill ){
        return "inputErr";
      }
      else
        return null;
    }
  };//getInvalidClass function ends

  //getwaybill returns waybill from $scope.waybills list
  var getWaybill = function(invoiceNumber){
    for(var i=0; i<$scope.waybills.length; i++){
      if($scope.waybills[i].invoiceNumber == invoiceNumber)
        return $scope.waybills[i];
    }
  };//getWaybill ends here

  //updates waybill
  $scope.update = function(waybill){
    if(waybill.edit == undefined || waybill.edit == null) return;
    if( !waybill.edit.isValidInvoice || !waybill.edit.isValidWaybill) return;
    var temp = waybill.edit.fullInvoice.split("-");
    waybill.cust_branch = temp[0];
    waybill.invoiceNumber = temp[1];
    waybill.waybillNumber = waybill.edit.waybillNumber;
    waybill.remark = waybill.edit.remark;
    delete waybill.edit;
    delete waybill.isEditing;
    var promise = WaybillService.updateWaybill(waybill);
    promise.then(
      function(data){
        console.log("waybill :"+ JSON.stringify(data) );
        return;
        WaybillService.update(data);
      },
      function(err){
        console.log("Error :"+ JSON.stringify(err));
      });
  }//end of update function

  /*formatinvoice function starts here*/
  $scope.formatInvoice = function(waybill){
    if( isNaN(waybill.edit.fullInvoice) ){
      waybill.edit.isValidInvoice = false;
      return;
    }
    var invoiceNumber = UtilityService.getFormatedInvoice(waybill.edit.fullInvoice);
    if(invoiceNumber.length != 10){
      waybill.edit.isValidInvoice = false;
    }else{
      waybill.edit.isValidInvoice = true;
    }
    waybill.edit.fullInvoice = invoiceNumber;
  }/*formatInvoice function ends*/

  /* plainInvoice gets plain invoice number */
  $scope.plainInvoice = function(waybill){
    if( waybill.edit.fullInvoice.length != 10 ){
        waybill.edit.isValidInvoice = false;
        return;
    }
    waybill.edit.fullInvoice = UtilityService.getPlainInvoice(waybill.edit.fullInvoice);
  }//plainInvoice ends

  $scope.checkInvoive= function(e, invoiceNumber){
    UtilityService.checkInvoice(e, invoiceNumber);
  }

  /*checking waybill number valid or not*/
  $scope.checkWaybillNumber = function(waybill){
    if( !UtilityService.isValidWaybillNum(waybill.edit.waybillNumber) ){
      waybill.edit.isValidWaybill = false;
      console.log("Not Valid waybill");
      return;
    }
    var dateDiff = (new Date().getTime() - UtilityService.getWaybillCreateDate(waybill.edit.waybillNumber).getTime()) / (1000*3600*24);
    if(Math.floor(dateDiff) >= 1 && Math.floor(dateDiff) <= 3){
      waybill.edit.isValidWaybill = true;
    }else{
      waybill.edit.isValidWaybill = false;
    }
  }//end of checkWaybillNumber

});

myapp.controller("yController", function($scope, WaybillService, UtilityService){
  $scope.waybill = {
    invoiceNumber: "",
    waybillNumber: "",
    remark: ""
  };
  $scope.labels = entryLabels;
  const waitingOverlay = "views/waitingOverlay.html"
  $scope.waitOverlay = "";


  /* checkInvoice starts here -- triggered when keydown pressed*/
  $scope.checkInvoice = function(e){
    UtilityService.checkInvoice(e, $scope.waybill.invoiceNumber);
  };
  /* checkInvoice ends here */

  /* starts hasErr function*/
  $scope.hasError = function(formName, fieldName){
    if(formName == null || formName == {}) return;
    if(fieldName == null ||fieldName == "") return;
    if(!formName[fieldName].$pristine && formName[fieldName].$invalid)
      return true;
    else
      return false;
  };
  /* hasErr function ends here */

  /* foramt invoice starts here*/
  $scope.formatInvoice = function(formName, fieldName){
    if( formName[fieldName].$invalid  ) return;
    if($scope.waybill.invoiceNumber.length != 9) {
        formName[fieldName].$invalid = true;
        return;
    }
    else{
      formName[fieldName].$invalid = false;
    }
    $scope.waybill.invoiceNumber = UtilityService.getFormatedInvoice($scope.waybill.invoiceNumber);
  }/*formatInvoice ends*/

  $scope.plainInvoice = function(formName, fieldName){
    if( formName[fieldName].$invalid  ) return;
    $scope.waybill.invoiceNumber = UtilityService.getPlainInvoice($scope.waybill.invoiceNumber);
  }

  //checkWaybillNumberLength starts here
  $scope.checkWaybillNumber = function(form, fieldName){
    var waybillNumber = $scope.waybill.waybillNumber;
    if(waybillNumber == undefined | waybillNumber == "") return;
    if(waybillNumber.length != 15 || isNaN(waybillNumber)){
      form[fieldName].$invalid = true;
    }
    else{
      form[fieldName].$invalid = false;
    }
  }//checkWaybillNumberLength ends here

  var isFormValid = function(form){
    if(form == undefined || form == null) return;
    var fieldNames = ['invoiceNumber', 'waybillNumber', 'remark'];
    var isValid = true;
    for(var i=0; i<fieldNames.length; i++){
      if(form[fieldNames[i]].$invalid){
        isValid = false;
        break;
      }
    }
    return isValid;
  };

  /*saveWaybill starts here*/
  $scope.saveWaybill = function(waybillForm){
    if( !isFormValid(waybillForm) ) return;
    var waybill = angular.copy($scope.waybill);
    $scope.waitOverlay = waitingOverlay;
    var promise = WaybillService.saveWaybill(waybill);
    promise.then(
      function(data){
        $scope.waitOverlay = ""
        if(data.duplicateKey)
          alert(data.desc);
        else
          resetForm(waybillForm);
      },
      function(err){
        $scope.waitOverlay = ""
        console.log( JSON.stringify(err) );
      });
  };//saveWaybill ends

  /*reseting form */
  var resetForm = function(form){
    $scope.waybill.invoiceNumber = "";
    $scope.waybill.waybillNumber = "";
    $scope.waybill.remark = "";
    form.$setPristine();
  }//resetForm ends here

});
