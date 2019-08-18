

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.is_running = false; 
        this.sprite = this.getComponent(cc.Sprite); 
    },


    start() {

    }, 

    start_time (time) {
        this.total_time = time; 
        this.is_running = true; 
        this.now_time = 0; 
    },

    update (dt) {

        if(this.is_running == true){
            this.now_time += dt; 
            var pre = this.now_time / this.total_time; 
            if(pre > 1){
                pre = 1; 
            }
            this.sprite.fillRange = pre; 
            if(this.now_time >= this.total_time){
                this.is_running = false; 
                this.sprite.fillRange = 0;
            }
        }
    },
});
