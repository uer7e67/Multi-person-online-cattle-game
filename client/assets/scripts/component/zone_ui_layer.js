var stype = require("../proto/stype"); 
var ctype = require("../proto/ctype"); 
var response = require("../utils/response");


cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._userdata = cc.gamedata.user; 
        this.title = this.node.getChildByName("title").getComponent(cc.Label);
        this.init();
    },

    init(){

        var zid = this._userdata.zid; 
        console.log("zid", zid);
        switch (zid) {
            case 1:
                this.title.string = "初级场"; 
                break;
            case 2: 
                this.title.string = "中级场"; 
            break;
            case 3: 
                this.title.string = "高级场"; 
                break;
            case 4: 
                this.title.string = "大师场"; 
                break;
            default:
                break;
        }
    },

    // 
    btn_return(){
        var data = {};
        data.zid = this._userdata.zid; 
        data.uid = this._userdata.uid;
        window.ws.send_cmd(stype.Game, ctype.Game.LeaveZone, data); 
    },

    // 快宿游戏
    btn_quick_enter(){
        var data = {};
        data.zid = this._userdata.zid; 
        data.uid = this._userdata.uid;
        window.ws.send_cmd(stype.Game, ctype.Game.QucickEnterRoom, data); 
    }, 



    start () {

    },

    // update (dt) {},
});
