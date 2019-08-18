var stype = require("../proto/stype"); 
var ctype = require("../proto/ctype");

cc.Class({
    extends: cc.Component,

    properties: {
        count_time : 3, 
        card_prefab: {
            type: cc.Prefab, 
            default: null,  
        } 

    },

    // LIFE-CYCLE CALLBACKS:
    // 
    onLoad () {
        //
        this._userdata = cc.gamedata.user; 
        // 获取座位  
        this.seat_root = this.node.getChildByName("seat_root"); 
        this.start_root = this.node.getChildByName("start_root"); 
        this.pai_root = this.node.getChildByName("pai_root");

        this.ui1 = this.node.getChildByName("ui1"); 
        this.ui2 = this.node.getChildByName("ui2"); 
        this.ui3 = this.node.getChildByName("ui3"); 
        this.pai = this.node.getChildByName('pai'); 

        this.title_bar = this.node.getChildByName("title_bar");
        this.stake_bar = this.node.getChildByName("stake_bar");
        this.stake_bar.active = false; 

        this._gamestart = false; 
        
        this.time1 = 0;
        this.show_ui1(); 
    },

    // 等待别的玩家操作 关闭所有ui
    hide_ui() {
        this.ui1.active = false; 
        this.ui2.active = false; 
        this.ui3.active = false; 
    },

    // 准备阶段  
    show_ui1(){
        this.ui1.active = true; 
        this.ui2.active = false; 
        this.ui3.active = false; 
    }, 

    // 操作阶段  
    show_ui2(){
        this.ui1.active = false; 
        this.ui2.active = true; 
        this.ui3.active = false; 
    }, 

    // 看牌后操作
    show_ui3(){
        this.ui1.active = false; 
        this.ui2.active = false; 
        this.ui3.active = true;         
    }, 

//########################## 准备
    //  准备按钮 
    prepare_btn(){
        var data = {};
        data.zid = this._userdata.zid; 
        data.rid = this._userdata.rid; 
        data.uid = this._userdata.uid;
        window.ws.send_cmd(stype.Game, ctype.Game.Prepare, data);
        this.hide_ui(); 
    }, 

    // 看牌 
    show_card(arr) {
        var x = 0 ;
        for(var i in arr){
            var card = cc.instantiate(this.card_prefab); 
            var info = this.card_transform(arr[i]); 

            this.pai.addChild(card); 
            card.x  = x;
            x += 30; 
            card.getComponent("Card").init(info); 
        }
    } ,

    // 销毁pai节点
    des_pai(){
        var children = this.pai.children;
        for (var i = 0; i < children.length; ++i) {
            children[i].destroy();
        }
    },

    /**
     * @param str A1 ... 
     * 将牌型字符串转换为牌的属性   
     */
    card_transform(str){
        var huase = str.substring(0, 1);
        var point = parseInt(str.substring(1, str.length));  
        var card = {}; 

        switch (huase) {
            case 'A':
                card.isRedSuit = true;  
                card.suit = 1; 
                break;
            case 'B':
                card.isRedSuit = false;  
                card.suit = 2; 
                break;
            case 'C':
                card.isRedSuit = false;  
                card.suit = 3; 
                break;
            case 'D':
                card.isRedSuit = true;  
                card.suit = 4; 
                break;

            default:
                break;
        }  
        
        if(point == 1){
            card.point = point; 
            card.pointName = 'A'; 
        }
        if(point <= 10 && point > 1){
            card.point = point; 
            card.pointName = point; 
        }
        if(point > 10){
            switch (point) {
                case 11:
                    card.point = point; 
                    card.pointName = 'J'; 
                    break;
                case 12:
                    card.point = point; 
                    card.pointName = 'Q'; 
                    break;
                case 13:
                    card.point = point; 
                    card.pointName = 'K'; 
                    break;
                default:
                    break;
            }
        }

        return card;
    },  

    // 刷新注
    show_stake_bar(s, ts){
        this.stake_bar.getComponent(cc.Label).string = "注："+ s + "，总注："+ ts; 
    },

    // 跟注   
    heel_stake(){
        var data = {};
        data.zid = this._userdata.zid; 
        data.rid = this._userdata.rid; 
        data.sid = this._userdata.sid;
        window.ws.send_cmd(stype.Game, ctype.Game.HeelStake, data);
    }, 

    // 加注  
    add_stake(){
        var data = {};
        data.zid = this._userdata.zid; 
        data.rid = this._userdata.rid; 
        data.sid = this._userdata.sid;
        window.ws.send_cmd(stype.Game, ctype.Game.AddStake, data);
    }, 

    //开始倒计时提示  
    count_down(dt){ 
        if(this.time1 > this.count_time){
            this.set_game_start(false);  
            this.title_bar.active = false; 
            this.stake_bar.active = true;
            this.time1 = 0; 
            return; 
        }
        this.title_bar.getComponent(cc.Label).string = "游戏开始" + Math.floor(this.count_time - this.time1);
        this.time1 += dt;  
    }, 



    // 设置游戏是否开始 
    set_game_start(s){
        this.title_bar.active = true; 
        this._gamestart = s; 
    }, 


    // ######################### end 

    // ########################  游戏中的ui 

    // 看牌
    look_card(){

        if(this._userdata.is_look){
            return; 
        }
        var data = {}; 
        data.zid = this._userdata.zid; 
        data.rid = this._userdata.rid; 
        data.sid = this._userdata.sid;
    
        window.ws.send_cmd(stype.Game, ctype.Game.LookCard, data);
    }, 

    // 结束本次操作 
    end_operation(){
        var data = {}; 
        data.zid = this._userdata.zid; 
        data.rid = this._userdata.rid; 
        data.sid = this._userdata.sid;
    
        window.ws.send_cmd(stype.Game, ctype.Game.EndOperation, data);
    } , 

    // 比牌
    compare_card(){
        var data = {};
        data.zid = this._userdata.zid; 
        data.rid = this._userdata.rid; 
        data.sid = this._userdata.sid;
        window.ws.send_cmd(stype.Game, ctype.Game.ComparCard, data);
    },
    
    // 弃牌 
    throw_card (){ 
        cc.log("放弃手牌 !!!");
    }, 
    // ######################### end


    // 离开房间按钮
    btn_return(){
        var data = {};
        data.zid = this._userdata.zid; 
        data.rid = this._userdata.rid; 
        data.uid = this._userdata.uid;
        window.ws.send_cmd(stype.Game, ctype.Game.LeaveRoom, data); 
    },

    start () {

    },

    update (dt) {
        // if(this._gamestart){
        //     this.count_down(dt);
        // } 
        // 游戏开始倒计时
        if(this._gamestart){
            this.count_down(dt); 
        }

        if(this._playerstart){

        }

    },
});
