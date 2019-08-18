var log = require("../../utils/log");
var netbus = require("../../netbus/netbus");
var conf = require("../svr.json"); 
var proto = require("../../netbus/proto_mgr");
var response = require("../respones");
var auth_dao = require("../../database/auth_dao");



// 命令号
var CMD = {
    RedeemCode : 1,         // 兑换码
    LoginAward : 2,         // 登录奖励
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 服务逻辑     
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
function assign_room(){  // 分配一个房间 
    for(var i in zone_lst){
        var z = zone_lst[i]; 
        for(var key in z.wait_lst){
            var p = z.wait_lst[key]; 
            var r = search_room(z); 
            if(r){
                z.wait_lst[key] = null; 
                r.enter(p); 
            }
        }
    }
} 


var service = {
    name : "Hall Server", 
    is_transfer: false ,     // 转发模块

    // 接受客户端消息
    on_recv_client: function (session, stype, ctype, msg, key){
    
        log.info(this.name, " recv:", stype, ctype, msg);
        switch(ctype){
            
            case CMD.LoginAward:    //登录奖励  
                break; 

            
            case CMD.RedeemCode:     // 兑换码 
                break; 
        }
        
    }, 

    // 服务被动丢失连接时调用
    on_disconnect: function(session, stype){

    }, 
}; 

module.exports = service; 