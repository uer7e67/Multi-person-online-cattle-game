cc.Class({
    extends: cc.Component,

    properties: {
        pai: {
            type: cc.Node, 
            default: [], 
        }, 

        card_back: {
            type: cc.Prefab, 
            default: null, 
        }, 

        coin: {
            type: cc.Prefab, 
            default: null, 
        }, 

        niu_type: {
            type: cc.Sprite,
            default: [], 
        },

        root: cc.Node, 
    },

    // LIFE-CYCLE CALLBACKS:
    // 发牌
    sendout_card(num){
        //开始的位置  
        cc.log("发牌！！！"); 
        for(var j = 0; j < num; j ++){
            var p1 = this.pai[j].position;
            for(var i = 0; i < 5;  i ++){
                if(this.pool.size()){
                    var card = this.pool.get();    
                    card.parent = this.node; 
                    p1.x += 25; 
                    var a1 = cc.moveTo(0.3, p1); 
                    card.runAction(a1); 
                }
            }
        }
    }, 

    sendout_card2(){
        //开始的位置  
        cc.log("发牌！！！"); 
        for(var j = 0; j < 5; j ++){
            var p1 = this.pai[j].position;  
            for(var i = 0; i < 5;  i ++){
                if(this.pool.size()){
                    var card = this.pool.get();    
                    card.parent = this.node; 
                    p1.x += 20; 
                    var a1 = cc.moveTo(0.3, p1); 
                    card.runAction(a1); 
                }
            }
        }
    },

    // 收牌  
    pickup_card(){
        cc.log("收牌！！！"); 
        var card = this.node.getChildByName("card_back");
        cc.log(card);
    },


    // 投注
    touzhu() {
        var c = cc.instantiate(this.coin); 
        var x = this.node.position.x + ranNum(); 
        var y = this.node.position.y + ranNum();
        var a = cc.moveTo(0.4, cc.p(x, y)); 
        this.node.addChild(c); 
        c.runAction(a);
    },

    onLoad () {
        this.pool = new cc.NodePool(); 
        for(var i = 0; i < 100; i ++){
            var card = cc.instantiate(this.card_back); 
            this.pool.put(card); 
        }
    },

    start () {

    },

    // update (dt) {},
});


function ranNum(){
    return Math.floor(Math.random() * 100 - 50); 
}; 