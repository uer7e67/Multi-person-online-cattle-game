

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on("touchstart", function(e){
            // e.stopPropagationImmediate();
        });
        
    },

    start () {

    },

    // update (dt) {},
});
