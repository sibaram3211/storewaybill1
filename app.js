var express = require("express");
var jade = require("jade");
var join = require("path").join;
var bodyParser = require("body-parser");
var app = express();
var pubDir = join(__dirname,"/public");
app.use( bodyParser.urlencoded( {extended:true} ) );
app.use( bodyParser.json() );
app.use( express.static(pubDir) );
app.set( "view engine", "jade" );
app.set( "views", pubDir+"/views" );
app.get( "/", function(req,res){
    res.render("welcome");
});

//app.get("/getOrders", OrderHandler.getOrderList,  OrderHandler.errorHandling);
//app.get("/getPendingOrders", OrderHandler.getPendingOrders, OrderHandler.errorHandling);
//app.post("/saveOrder", OrderHandler.saveOrder,  OrderHandler.errorHandling);
//app.post("/updateOrder", OrderHandler.updateOrder,  OrderHandler.errorHandling);
//app.post("/removeOrder", OrderHandler.removeOrder,  OrderHandler.errorHandling);

app.listen(3006);
