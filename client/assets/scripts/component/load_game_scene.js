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

    onLoad () {
        this.title = this.node.getChildByName("title").getComponent(cc.Label); 
        cc.loader.loadResDir("game", function(comletedCount, totalCount, item){
            this.title.string = "加载了" + comletedCount  + "/" + totalCount;
        }.bind(this), function(err, ret){
            if(err){
                console.log(err); 
                return; 
            }
            cc.director.loadScene("game_scene"); 
        }); 
    },

    start () {

    },

    // update (dt) {},
});
