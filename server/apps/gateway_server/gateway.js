var log = require("../../utils/log");
var netbus = require("../../netbus/netbus"); 
var proto = require("../../netbus/proto_mgr"); 

var service = {
    name : "Gateway Server", 
    is_transfer: true ,     // 转发模块

    // 接受客户端消息
    on_recv_client: function (session, stype, ctype, msg){
    
        // 获取游戏服务器 session
        var server_session = netbus.GET_SVR_SESSION(stype); 
        if(!server_session){
            log.error("获取游戏服务器session失败"); 
            return; 
        }

        // 玩家的key 命令号
        var key = session.session_key;
        var data = proto.json_encode2(stype, ctype, msg, key); 

        // 发送给相应的游戏服务器
        netbus.SESSION_SEND(server_session, data); 

    }, 
    
    // 接受到服务器端消息
    on_recv_server: function(session, stype, ctype, msg, key){

        // 获取玩家session
        var client_session = netbus.GET_LNT_SESSION(key); 
        // log.warn("测试： 玩家key", key);
        if(!client_session){
            log.error("获取玩家session失败"); 
            return; 
        }
        
        var data = proto.json_encode(stype, ctype, msg);
        // console.log("网关,游戏服务器返回的消息", data); 
        netbus.SESSION_SEND(client_session, data);

    },
    
    // 服务被动丢失连接时调用
    on_disconnect: function(session, stype){

    }, 
}; 

module.exports = service; 
