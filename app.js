var express = require("express");
var jade = require("jade");
var session = require("express-session");
var join = require("path").join;
var connection = require("E:/storewaybill/schema/connectionTool.js");
var WaybillHandler = require("E:/storewaybill/schema/handlers/waybillHandler.js");
var LoginHandler = require("E:/storewaybill/schema/handlers/loginHandler.js");
var CheckUserAuthentication = require("E:/storewaybill/schema/handlers/checkAuthentication.js");
var bodyParser = require("body-parser");
var app = express();
var pubDir = join(__dirname,"/public");
app.use( express.static(pubDir) );
app.set("view engine", "jade");
app.set("views", pubDir+"/views");

app.use( bodyParser.urlencoded( {extended:true} ) );
app.use( bodyParser.json() );

app.use( session({
  secret: 'MFMFMFKEY',
  resave: false,
  httpOnly: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1*60*1000,
    expires: 1*60*1000
  }
}));

app.get("/waybill", CheckUserAuthentication.confirmAutho);
app.get("/login", CheckUserAuthentication.confirmAutho);
app.post("/doLogin", LoginHandler.login);
app.get("/getUserSession", CheckUserAuthentication.getUserSession);
app.get("/dosignout", CheckUserAuthentication.signout);
app.post("/addUsers", LoginHandler.addUsers);
app.post("/saveWaybill", WaybillHandler.saveWaybill);
app.get("/downloadXlsxFile", WaybillHandler.downloadXlsxFile);
app.post("/getWaybillsByCriteria", WaybillHandler.getWaybillsByCriteria);
app.post("/removeWaybill", WaybillHandler.removeWaybill);
app.post("/updateWaybill", WaybillHandler.updateWaybill);
app.get("/getWaybillByInvoice", WaybillHandler.getWaybillByInvoice);
var port = process.env.PORT || 3000;
//var port = 3006;
app.listen(port);
