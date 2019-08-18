var conf = require("../svr.json"); 
var netbus = require("../../netbus/netbus"); 
var service_mgr = require("../../netbus/service_mgr"); 
var gateway = require("./gateway");
var talkroom = require("../talkroom_server/talkroom");

// 注册网关服务  
var gateway_conf = conf["gateway"];  
netbus.BOOT_UP_SERVER(gateway_conf.host, gateway_conf.port);
service_mgr.REG_SVR(gateway_conf.stype, gateway); 

// 连接到认证服务
var auth_conf = conf["auth"]; 
netbus.CON_TO_SERVER(auth_conf.host, auth_conf.port, auth_conf.stype);

// 连接到聊天室服务
// var talkroom_conf = conf["talkroom"]; 
// netbus.CON_TO_SERVER(talkroom_conf.host, talkroom_conf.port, talkroom_conf.stype); 

// 连接到大厅服务  
var hall_conf = conf["hall"]; 
netbus.CON_TO_SERVER(hall_conf.host, hall_conf.port, hall_conf.stype); 

// // 连接到游戏服务   
var game_conf = conf["game"]; 
netbus.CON_TO_SERVER(game_conf.host, game_conf.port, game_conf.stype); 