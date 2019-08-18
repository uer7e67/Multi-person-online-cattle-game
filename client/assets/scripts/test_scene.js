
cc.Class({
    extends: cc.Component,

    properties: {
        total: 10, 
        num : cc.Node, 
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.time = 0 ; 
        this.isStart = false ; 
    },

    start () {

    },

    set_start(s){
        this.isStart = s ; 
    }, 


    update (dt) {
        if(this.isStart){
            if(this.time > this.total){
                return; 
            }
            this.num.getComponent(cc.Label).string = Math.floor(this.total - this.time);   
            this.time += dt; 
        }   
        
    },
});
