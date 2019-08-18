var log = require("../../utils/log");
var netbus = require("../../netbus/netbus");
var proto = require("../../netbus/proto_mgr");
var Response = require("../respones");
var utils = require("../../utils/utils");
var auth_dao = require("../../database/auth_dao"); 

// 协议配置
var CMD = {
    GUEST_LOGIN: 1,  // 游客登录
    FORMAL_LOGIN:2,  // 帐号密码
    VX_LOGIN:    3,  // 微信登录 
    FORGET_PWD:  4,  // 忘记密码
}

    // 帐号密码登录  
    // msg : { name , password};

function formal_login(session, stype, ctype, msg, key){
    var data ; 
    var body = {}; 
    var uname = msg.uname; 
    var pwd = msg.pwd; 
    // 判断name  
    if(uname == null || pwd == null){
        log.info("帐号或者密码为空...");
        body.state = Response.ERROR; 
        // 打包发送
        data = proto.json_encode2(stype, ctype, body, key);
        netbus.SESSION_SEND(session, data);
    }
    else{
        //
        auth_dao.uname_query(uname, function(state, res){
            if(state == Response.SQL.EMPTY){
                log.info("账号不存在 ..."); 
                body.state = Response.AUTH.UNEXIT;   //返回的状态码
                // 打包发送
                data = proto.json_encode2(stype, ctype, body, key);
                netbus.SESSION_SEND(session, data);
            }
            else if(state == Response.SQL.SUCCESS){
                // 判断密码对错
                if(res.upwd == pwd){
                    log.info("验证成功 ...");
                    body.state = Response.OK;  
                    body.guest_key = res.guest_key;

                    body.uid = res.uid; 
                    body.unick = res.unick;     // nicheng    
                    body.uface = res.uface;    // touxian 
                    body.uvip = res.uvip;   
                    body.uscore = res.uscore;   //积分  
                    body.uwealth = res.uwealth;    // 财富值 

                    // 打包发送
                    data = proto.json_encode2(stype, ctype, body, key);
                    netbus.SESSION_SEND(session, data);
                }
                else{
                    log.info("验证失败 ..."); 
                    body.state = Response.AUTH.ERRPWD;
                    // 打包发送
                    data = proto.json_encode2(stype, ctype, body, key);
                    netbus.SESSION_SEND(session, data);
                }
            }
        }); 
    }
}

// 游客登录
function guest_login(session, stype, ctype, msg, key){
    
    var body = {};
    var data; 
    var guest_key = msg; 
    if(!guest_key){
              
        body.state = Response.INVALID_PARAMS;   //返回的状态码
        data = proto.json_encode2(stype, ctype, body, key);
        netbus.SESSION_SEND(session, data);
    }   
    else{

        auth_dao.gst_query(guest_key, function(r_code, res){

            if(r_code == Response.SQL.ERROR && res == null){  
                log.info("Query Return Null, New a Guest... "); 

                var unick = "游客"+utils.ran_str(5);  
                auth_dao.gst_login(unick, guest_key, function(r_code){
                    if(r_code == Response.ERROR){ 
                        return; 
                    }
                    else{
                        auth_dao.gst_query(guest_key, function(r_code2, res2){
                            body.state = Response.OK;  
                            body.guest_key = res2.guest_key;
                            body.uid = res2.uid; 
                            body.unick = res2.unick;     // nicheng    
                            body.uface = res2.uface;    // touxian 
                            body.uvip = res2.uvip;   
                            body.uscore = res2.uscore;   //积分  
                            body.uwealth = res2.uwealth;    // 财富值 

                            data = proto.json_encode2(stype, ctype, body, key);
                            netbus.SESSION_SEND(session, data);
                        })
                    }
                });    
            }
            else{
                // log.info("游客查询成功！！！");
                // log.info("res:", res);
                body.state = Response.OK;  
                body.guest_key = res.guest_key;
                body.uid = res.uid; 
                body.unick = res.unick;     // nicheng    
                body.uface = res.uface;    // touxian 
                body.uvip = res.uvip;   
                body.uscore = res.uscore;   //积分  
                body.uwealth = res.uwealth;    // 财富值 

                data = proto.json_encode2(stype, ctype, body, key);
                netbus.SESSION_SEND(session, data);
            }
        })
    }
}

// 找回密码 
function forget_pwd(){



}


// 微信登录 
function vx_login(){

}

var service = {
    name : "Auth Server", 
    is_transfer: false ,     // 转发模块

    // 接受客户端消息
    on_recv_client: function (session, stype, ctype, msg, key){
        log.info(this.name, "recv:", stype, ctype, msg);
        switch(ctype){
            case CMD.GUEST_LOGIN:     // 游客登陆  
                    guest_login(session, stype, ctype, msg, key);
                break;
            case CMD.FORMAL_LOGIN:    // 帐号密码登录  
                    formal_login(session, stype, ctype, msg, key);
                break; 
            case CMD.VX_LOGIN:        // 微信登录  
                    vx_login();
                break;
            case CMD.FORGET_PWD:      // 忘记密码  
                    forget_pwd(); 
                break; 

        }

    }, 

    // 服务被动丢失连接时调用
    on_disconnect: function(session, stype){
        
    }, 
}; 

module.exports = service; 