var stype = require("./proto/stype"); 
var ctype = require("./proto/ctype"); 
var response = require("./utils/response");


cc.Class({
    extends: cc.Component,

    properties: {
        uface_sprites: {
            type: cc.SpriteFrame, 
            default: [], 
        }, 
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 注册监听事件  
        var server_handlers = {}; 
        server_handlers[stype.Hall] = this.on_hall_server_return.bind(this); 
        server_handlers[stype.Game] = this.on_game_server_return.bind(this); 
        window.ws.register_serivces_handler(server_handlers);

        this._userdata = cc.gamedata.user; 

        this._ui = this.node.getChildByName("UI");
        this._uinfo = this._ui.getChildByName("top_uinfo");
        // 
        this.init();
    },

    // 
    on_game_server_return(_stype, _ctype, _data){
        // cc.log("game:", _stype, _ctype, _data); 
        switch (_ctype) {
            case ctype.Game.EnterZone:
                
            
                if(_data.state == response.OK){
                    this._userdata.zid = _data.zid; 
                    cc.director.loadScene("zone_scene");   
                }
                else if(_data.state == response.ERROR){
                    console.log("不符合进入要求 !!!"); 
                }
                break;
        
            default:
                break;
        }
    },

    // 大厅服务监听器
    on_hall_server_return(_stype, _ctype, data){
        // console.log(data);
        switch (_ctype) {
            
            case ctype.Hall.EnterRoom: 
                break; 

            case ctype.Hall.LeaveZone: 
                break; 

            default:
                break;
        }




    },

    init(){
        // 初始化头像
        this._uface = cc.find("uface/face", this._uinfo);
        var face_index = this._userdata.uface; 
        this._uface.getComponent(cc.Sprite).spriteFrame = this.uface_sprites[face_index];
        // 初始化昵称
        this._unick = cc.find("unick", this._uinfo); 
        this._unick.getComponent(cc.Label).string = this._userdata.unick;
        // 初始化积分  
        this._uscore = cc.find("uscore/score", this._uinfo); 
        this._uscore.getComponent(cc.Label).string = this._userdata.uscore; 

        // 初始化财富  
        this._uwealth = cc.find("uwealth/wealth", this._uinfo); 
        this._uwealth.getComponent(cc.Label).string = this._userdata.uwealth; 
    },

    // 进入分区
    enter_zone(e, index){
        var _zid = parseInt(index); 
        if(_zid < 1 || _zid > 4){
            return; 
        }
        var data = {
            zid : _zid, 
            uid : this._userdata.uid, 
        }; 
        ws.send_cmd(stype.Game, ctype.Game.EnterZone, data); 
    },

    // 进入商店 
    enter_shop(){

    },

    start () {

    },

    // update (dt) {},
});
