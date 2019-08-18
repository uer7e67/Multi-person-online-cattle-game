var auth = require("auth");
var utils = require("utils");
var stype = require("../proto/stype"); 
var ctype = require("../proto/ctype"); 
var response = require("response"); 

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.ui_1 = this.node.getChildByName("ui_1");
        this.ui_2 = this.node.getChildByName("ui_2");
        this.ui_3 = this.node.getChildByName("ui_3");

        this.ui_1.active = true; 
        this.ui_2.active = false; 
        this.ui_3.active = false; 
    },

    start () {

    },

    // 游客登录 
    on_btn_visitor(){
        auth.guest_login();
    }, 
    
    // 微信登录
    on_btn_weixin(){
        var msg = {
            name: "haoren", 
            pwd : "123", 
        }; 
        ws.send_cmd(1, 2, msg); 
    }, 

    // 跳转到ui_2
    on_btn_formal(){
        this.ui_1.active = false; 
        this.ui_2.active = true; 
        this.ui_3.active = false; 
    }, 

    // 帐号密码登录   
    on_btn_formal_login(){
        // 获取输入的帐号密码  
        
        var uname = this.ui_2.getChildByName("name").getComponent(cc.EditBox).string; 
        var pwd = this.ui_2.getChildByName("pwd").getComponent(cc.EditBox).string; 
        var msg = {
            uname: uname, 
            pwd  : pwd,  
        }; 
        ws.send_cmd(stype.Auth, ctype.auth.formal_login, msg); 
    }, 

    // 跳转到ui_3  
    on_btn_forgetpwd(){
        this.ui_1.active = false; 
        this.ui_2.active = false; 
        this.ui_3.active = true; 
    }, 

    // 提交修改信息
    on_btn_forgetpwd_tijiao(){

    }, 

    // 点击返回按钮
    on_btn_return(){
        this.ui_1.active = true; 
        this.ui_2.active = false; 
        this.ui_3.active = false; 
    },

    // update (dt) {},
});
