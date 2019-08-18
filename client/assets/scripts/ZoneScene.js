var stype = require("./proto/stype"); 
var ctype = require("./proto/ctype"); 
var response = require("./utils/response");

cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var server_handlers = {}; 
        server_handlers[stype.Game] = this.on_game_server_return.bind(this); 
        window.ws.register_serivces_handler(server_handlers);
        this._userdata = cc.gamedata.user; 
    },

    start () {

    },

    on_game_server_return(_stype, _ctype, _data){
        // cc.log("game:", _stype, _ctype, _data); 
        switch (_ctype) {
            case ctype.Game.QucickEnterRoom:
                if(_data.state == response.OK){
                    cc.log("进入游戏成功!!!!"); 
                    cc.log("房间号：", _data.rid);
                    this._userdata.rid = _data.rid; 
                    this._userdata.sid = _data.sid; 
                    cc.director.loadScene("load_game_scene"); 
                }
                else{
                    cc.log("进入游戏失败!!!"); 
                }
                break ;

            case ctype.Game.LeaveZone: 
                if(_data.state == response.OK){
                    console.log("退出分区 !!!"); 
                    this._userdata.zid = -1; 
                    this._userdata.sid = -1; 
                    cc.director.loadScene("hall_scene");
                }
                break; 
        
            default:
                break;
        }
    },

    // update (dt) {},
});
