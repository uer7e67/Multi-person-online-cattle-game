var ws = require("ws"); 
var log = require("../utils/log"); 
var service_mgr = require("./service_mgr"); 

var global_session_list = {};
var global_seesion_key = 1;

// 协议类型  采用通用的json数据
// 通信类型  ws模块   
// 开始时间  2018/3/19

/////////////////////////////////////////////////////////////////////////////////////////////////
// 服务端部分  
/////////////////////////////////////////////////////////////////////////////////////////////////
// 监听客户端接入  
function on_session_enter(session){
    log.info("client enter ...", session._socket.remoteAddress, session._socket.remotePort);
    //  
    session.is_connected = true;
    // 全局session表  
    // log.info(global_seesion_key);
    global_session_list[global_seesion_key] = session;
	session.session_key = global_seesion_key;
	global_seesion_key ++;
}

// 监听客户端离开   
function on_session_exit(session){
    log.info("client exit ..."); 
    service_mgr.CLIENT_LOST_CONNECT(session);
    session.is_connected = false; 
    if (global_session_list[session.session_key]) {
		global_session_list[session.session_key] = null;
		delete global_session_list[session.session_key]; // 把这个key, value从 {}里面删除
		session.session_key = null;
	}
}

// 获取玩家的session 
function get_client_session(key){
    return  global_session_list[key];
}

// 发送数据  
function session_send(session, cmd){
    if(session.is_connected){
        session.send(cmd);
    }
    else{
        return;
    }
}

// 主动关闭session
function session_close(session){
    session.close();
}

// 客户端事件监听器   
function clnt_listener(session){
    // 
    on_session_enter(session); 

    session.on("close", function(){
        on_session_exit(session); 
    }); 

    session.on("error", function(err){
        log.error("client error ..."); 
    }); 

    session.on("message", function(msg){
        service_mgr.SERVER_LISTENER(session, msg); 
    });     
}

// 启动服务器  
function boot_up_server(host, port){
    log.info("start ws server ...", host, port); 

    var server = new ws.Server({
        // host: host, 
        port: port, 
    }); 

    server.on("connection" , function(clnt_sock){
        clnt_listener(clnt_sock); 
    });

    server.on("error", function(err){
        log.error("ws server listen error!!");
    }); 

    server.on("close", function(){
        log.error("ws server listen close!!");
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////
// 客户端部分  
/////////////////////////////////////////////////////////////////////////////////////////////////
var service_connect_lst = {} ; 

// 获取服务器的session
function get_server_session(stype){
    return service_connect_lst[stype]; 
}

// 监听连接服务 
function on_connected_server(clnt_sock, stype){
    clnt_sock.is_connected = true; 
	//加入游戏服务器的session 表 
	service_connect_lst[stype] = clnt_sock; 
	clnt_sock.session_key = stype; 
    // log.warn("连接表： ", stype); 
}

// 连接到服务器 
function connect_server(host, port, stype) {
    var clnt_sock = new ws("ws://"+host+":"+port); 

    clnt_sock.on("open", function(){
        log.info("connect server success ..."); 
        on_connected_server(clnt_sock, stype); 
    }); 

    clnt_sock.on("message", function(data){
        service_mgr.CLIENT_LISTENER(clnt_sock, data);
    });

    clnt_sock.on("error", function(err){
        log.error("client error"); 
    }); 

    clnt_sock.on("close", function(){
        if(clnt_sock.is_connected === true){
            clnt_sock.is_connected = false;
            service_connect_lst[stype] = null; 
            delete service_connect_lst[stype];
	        clnt_sock.session_key = null; 
        }
        log.warn("Lost connection, three seconds after reconnection ... ");
        setTimeout(function() {
            connect_server(host, port, stype);
        }, 3000);
    });
}

var netbus = {
    BOOT_UP_SERVER: boot_up_server,   // 启动服务器 
    CON_TO_SERVER: connect_server,    // 连接到服务器 
    SESSION_SEND: session_send,       // 
    SESSION_CLOSE: session_close, 
    GET_SVR_SESSION: get_server_session, // 获取服务session 
    GET_LNT_SESSION: get_client_session, // 获取玩家的session
}

module.exports = netbus; 