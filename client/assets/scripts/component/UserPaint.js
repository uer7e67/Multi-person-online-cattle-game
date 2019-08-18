

cc.Class({
    extends: cc.Component,

    properties: {
        uface:{
            type: cc.SpriteFrame, 
            default: [],
        },
    },

    

    onLoad () {
        // 玩家信息 
        this._userdata = cc.gamedata.user; 
        this.user = this.node.getChildByName("user");
        this.ui1 = this.user.getChildByName("ui1"); 
        this.ui2 = this.user.getChildByName("ui2"); 
    },

    start () {

    },

    return_btn() {
        this.node.active = false; 
    },

    updata_btn() {
        this.ui1.active = false; 
        this.ui2.active = true; 
    },  

    back_btn() {
        this.ui1.active = true; 
        this.ui2.active = false; 
    },

    save1() {
        var data = {
            unick: "11", 
            uface: "", 
        }; 
        
    }, 
    
    save2 () {
        var data = {
            uname: "11", 
            upwd: "11",
        };  
    }, 


    showinfo() {
        this.unick = this.ui1.getChildByName("unick"); 
        this.uface = this.ui1.getChildByName("uface");
    }, 

    // update (dt) {},
});
