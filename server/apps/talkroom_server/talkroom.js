var log = require("../../utils/log");
var netbus = require("../../netbus/netbus");
var conf = require("../svr.json"); 
var proto = require("../../netbus/proto_mgr");

var service = {
    name : "Talkroom Server", 
    is_transfer: false ,     // 转发模块

    // 接受客户端消息
    on_recv_client: function (session, stype, ctype, msg, key){
        
        // 网关发来的消息  
        log.info("聊天室：", msg);


        var body = {}; 
        body.msg = "我是聊天室"; 
        body.res = "ok"; 
        var data = proto.json_encode2(stype, ctype, body, key);
        netbus.SESSION_SEND(session, data);

    }, 

    // 服务被动丢失连接时调用
    on_disconnect: function(session, stype){

    }, 
}; 

module.exports = service; 