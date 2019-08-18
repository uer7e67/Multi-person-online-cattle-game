var netbus = require("../../netbus/netbus"); 
var service_mgr = require("../../netbus/service_mgr");
var conf = require("../svr.json"); 

var game = require("./game");
var game_conf = conf["game"];

// 启动认证服务 
netbus.BOOT_UP_SERVER(game_conf.host, game_conf.port); 
service_mgr.REG_SVR(game_conf.stype, game); 