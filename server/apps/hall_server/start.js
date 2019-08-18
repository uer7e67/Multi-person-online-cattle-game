var log = require("../../utils/log"); 
var netbus = require("../../netbus/netbus"); 
var service_mgr = require("../../netbus/service_mgr"); 
var conf = require("../svr.json"); 
var hall = require("./hall");

var hall_conf = conf["hall"]; 
netbus.BOOT_UP_SERVER(hall_conf.host, hall_conf.port); 
service_mgr.REG_SVR(hall_conf.stype, hall);

