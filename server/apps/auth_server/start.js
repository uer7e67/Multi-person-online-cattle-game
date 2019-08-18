var netbus = require("../../netbus/netbus"); 
var service_mgr = require("../../netbus/service_mgr");
var conf = require("../svr.json"); 

var auth = require("./auth");
var auth_conf = conf["auth"];

// console.log(auth_conf);

// 启动认证服务 
netbus.BOOT_UP_SERVER(auth_conf.host, auth_conf.port); 
service_mgr.REG_SVR(auth_conf.stype, auth); 