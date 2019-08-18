var log = require("../utils/log"); 
var proto = require("./proto_mgr");

var service_mgr = {
    REG_SVR: register_service, 
    SERVER_LISTENER: server_listener,   
    CLIENT_LISTENER: client_listener, 
    CLIENT_LOST_CONNECT: client_lost_connect, 
}; 

var service_modules = {} ; 

/**
 * 注册服务
 * @param stype 服务号
 * @param service 服务
 */
function register_service(stype, service){
    var name = service.name;
    //如果服务已经存在
    if(service_modules[stype]){    
        log.warn(name + "service aleady registed.."); 
        return;
    }
    service_modules[stype] = service; 
    // log.info(service_modules);
    log.info(name + " service registe success..");   
}

/**
 *  服务器监听器
 *  state1 ：网关收到玩家的消息 
 *  state2 ：游戏服务器监听网关转发的消息
 */
function server_listener(session, buf){

    // 解码 
    var data = proto.json_decode(buf);
    if(!data){
        return false;
    } 

    // 获取数据
    var stype, ctype, msg, key; 
    stype = data[0]; 
    ctype = data[1]; 
    msg   = data[2]; 
    key   = data[3]; 
    // log.info(data);

    if(key == null){
        service_modules[0]. on_recv_client(session, stype, ctype, msg);
    }
    else{
        if(!service_modules[stype]){
            log.info("该服务不存在 ... ");
            return;
        }
        service_modules[stype].on_recv_client(session, stype, ctype, msg, key);
    }
}

/**
 * 网关收到游戏服务器返回的消息
 * @param session 网关的session  
 * @param buf     
 */
function client_listener(session, buf)
{
    var stype, ctype, msg, key; 
    var data = proto.json_decode(buf); 
    stype = data[0]; 
    ctype = data[1]; 
    msg   = data[2]; 
    key   = data[3]; 
    service_modules[0].on_recv_server(session, stype, ctype, msg, key);
}


/**
 * 玩家断开连接
 * @param 
 */
function client_lost_connect(){
    log.info("玩家断开链接！！！");
}

module.exports = service_mgr; 
