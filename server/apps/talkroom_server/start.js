var netbus = require("../../netbus/netbus"); 
var service_mgr = require("../../netbus/service_mgr");
var conf = require("../svr.json"); 

// 注册聊天室
var talkroom = require("./talkroom");
var talkroom_conf = conf["talkroom"];

// 启动服务 
netbus.BOOT_UP_SERVER(talkroom_conf.host, talkroom_conf.port); 
service_mgr.REG_SVR(talkroom_conf.stype, talkroom); 