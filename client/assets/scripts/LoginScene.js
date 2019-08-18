var auth = require("auth");
var utils = require("utils"); 
var stype = require("stype"); 
var ctype = require("./proto/ctype"); 
var response = require("./utils/response"); 

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        // 
        if(cc.sys.isMobile){
            console.log("移动端运行"); 
        }
        else{
            console.log("电脑端运行"); 
        }

        // 
        window.ws = require("./modules/websocket"); 
        window.ws.connect("ws://119.23.108.74:6080");

        // 注册监听事件  
        var server_handlers = {}; 
        server_handlers[stype.Auth] = this.on_auth_server_return.bind(this); 
        window.ws.register_serivces_handler(server_handlers); 

        //  
        this._userdata = cc.gamedata.user; 
    },

    // 监听服务器的返回
    on_auth_server_return(_stype, _ctype, _data){
        cc.log("data:", _data);

        switch(_ctype)
        {
            case ctype.auth.guest_login:     // 游客登录  

                if(_data.state == response.OK){   
                    // 登录成功
                    var guest_key = _data.guest_key; 
                    cc.sys.localStorage.setItem("guest_key", guest_key); 
                    this.init_uinfo(_data.uid, _data.uface, _data.unick, _data.uvip, _data.guest_key, _data.uscore, _data.uwealth); 
                    
                    // 跳转场景
                    console.log("登录成功 ...");
                    cc.director.loadScene("load_hall_scene");
                }
                else{
                    console.log("登录失败 ...."); 
                }

                break; 


            case ctype.auth.formal_login:    // 帐号密码登录  
                if(_data.state == response.OK){
                    this.init_uinfo(_data.uid, _data.uface, _data.unick, _data.uvip, _data.guest_key, _data.uscore, _data.uwealth); 
                    console.log("登录成功 ...");
                    cc.director.loadScene("load_hall_scene");
                }
                else if(_data.state == response.AUTH.ERRPWD){
                    console.log("密码错误 ..."); 
                    return; 
                }
                else if(_data.state == response.AUTH.UNEXIT){
                    console.log("帐号不存在 ..."); 
                    return; 
                }

                break;    

            case ctype.auth.vx_login:        // 微信登录   
                
                break; 

            case ctype.auth.forgetpwd:       // 忘记密码   
                break; 
        }
        
    },

    // 初始化玩家信息   
    init_uinfo(id, face, nick, vip, key, score, wealth){
        this._userdata.guest_key = key; 
        this._userdata.uid = id; 
        this._userdata.uface = face; 
        this._userdata.unick = nick;
        this._userdata.uvip = vip;  
        this._userdata.uscore = score; 
        this._userdata.uwealth = wealth; 
    },

    


    // update (dt) {},
});
