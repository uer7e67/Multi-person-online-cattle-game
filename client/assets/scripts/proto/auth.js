var utils = require("utils"); 
var stype = require("stype");
var ctype = require("ctype"); 

// 游客登录
function guest_login(){

    var guest_key =  cc.sys.localStorage.getItem("guest_key"); 
    if(!guest_key){
        guest_key = utils.ran_str(32); 
        window.ws.send_cmd(stype.Auth, ctype.auth.guest_login, guest_key); 
    }
    else{
        window.ws.send_cmd(stype.Auth, ctype.auth.guest_login, guest_key); 
    }

}

// 微信登录 
function vx_login(){
    
}

module.exports = {
    guest_login: guest_login,  
    vx_login: vx_login, 
}