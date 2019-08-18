// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    onEnable() {
        this.node.on('touchstart', function (event) {
            console.log("touchstart");
            event.stopPropagation();
        });
        this.node.on('touchend', function (event) {
            event.stopPropagation();
        });
    }, 

    onDisable() {
        this.node.on('touchstart', function (event) {
            event.stopPropagation();
        });
        this.node.on('touchend', function (event) {
            event.stopPropagation();
        });
    }, 

    start () {

    },

    // update (dt) {},
});
