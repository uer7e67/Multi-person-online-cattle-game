
cc.Class({
    extends: cc.Component,

    properties: {
        player_paint: {
            type: cc.Node, 
            default: null, 
        }, 
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    // 玩家面板
    on_menuplayer(){
        this.player_paint.active = true; 
    },



    // 背包
    on_menubag(){

    },

    start () {

    },

    // update (dt) {},
});
