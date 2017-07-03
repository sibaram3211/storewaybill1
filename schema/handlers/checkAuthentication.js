const loginPage = "login";
const waybillEntryPage = "waybillEntry";
const waybillUrl = "/waybill";
const loginUrl = "/login";
const checkAuthoURL = "/checkAuthentication";

var routes = {
  login: {
    url: "/login",
    page:"login"
  },
  waybill: {
    url : "/waybill",
    page: "waybillEntry"
  }
};

//confirmAutho function
var confirmAutho = function(req, res, next){
  if(req.session && req.session.userName){
    if(routes.login.url == req.url){
      return res.redirect(routes.waybill.url);
    }else{
      return res.render(routes.waybill.page);
    }
  }
  return res.render(routes.login.page);
};
//confirmAutho function ends here

//signout function
var signout = function(req, res, next){
  if(req.session && req.session.userName){
    req.session.destroy();
  }
  return res.redirect(routes.login.url);
};//signout function ends here

//getUserSession
var getUserSession = function(req, res, next){
  var userSession = {};
  if(req.session && req.session.userName){
    userSession.userName = req.session.userName;
  }else{
    userSession = null;
  }
  res.json(userSession);
};//getUserSession ends

//module.exports.checkSessionAlive = checkSessionAlive;
module.exports.signout = signout;
module.exports.confirmAutho = confirmAutho;
module.exports.getUserSession = getUserSession;
//module.exports.redirectToCheckAutho = redirectToCheckAutho;
