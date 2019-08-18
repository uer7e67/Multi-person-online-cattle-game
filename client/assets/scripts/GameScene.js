var stype = require("./proto/stype"); 
var ctype = require("./proto/ctype"); 
var response = require("./utils/response");

cc.Class({
    extends: cc.Component,

    properties: {
        uhead: {
            type: cc.SpriteFrame, 
            default: [], 
        }, 
        nullhead: {
            type: cc.SpriteFrame, 
            default: null,  
        }, 
        time_bar: {
            type: cc.Node, 
            default: null, 
        }, 
        seat_sid: {
            type: cc.Node, 
            default: [], 
        }, 
        niu_type: {
            type: cc.SpriteFrame,
            default: [], 
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._userdata = cc.gamedata.user; 
        this.ui_layer = this.node.getChildByName("ui_layer");
        this.seat_root = this.ui_layer.getChildByName("seat_root");  
        this.pai_root = this.ui_layer.getChildByName("pai_root"); 

        var server_handlers = {}; 
        server_handlers[stype.Game] = this.on_game_server_return.bind(this); 
        window.ws.register_serivces_handler(server_handlers);

        this.set_your_turn(false); 

        this.init_room();
        this.req_seat_lst();
    },

    // 请求房间座位列表 
    req_seat_lst(){
        var data = {}; 
        data.rid = this._userdata.rid;
        data.zid = this._userdata.zid;  
        // cc.log(this._userdata);
        ws.send_cmd(stype.Game, ctype.Game.ReqFrashSeatLst, data); 
    }, 

    set_your_turn(whether){
        this.your_turn = whether; 
    }, 

    // 服务器返回数据  
    on_game_server_return(_stype, _ctype, _data){
        switch (_ctype) {
            case ctype.Game.RefrashRoomPlayer:
                // 被动
                this.updata_room(_data.seat_lst); 
                break;

            case ctype.Game.ReqFrashSeatLst: 
                // {seat_lst}
                this.updata_room(_data.seat_lst);
                break; 

            case ctype.Game.LeaveRoom: 
                this.leave_room(_data); 
                break; 

            case ctype.Game.GameStart:   
                
                if(_data.state != response.OK){
                    return; 
                } 

                cc.log("游戏开始");
                var num = _data.num; 
                this.ui_layer.getComponent("game_ui_layer").set_game_start(true);
                this._userdata.is_look = false;
                this.ui_layer.getComponent("game_ui_layer").show_stake_bar(10, 0);
                setTimeout(() => {
                    // cc.log("发牌!!!"); 
                    this.pai_root.getComponent("game_anim_mgr").sendout_card(num); 
                }, 3000);
                break; 

            case ctype.Game.TurnToNextPlayer: 
                var thinktime = _data[0]; 
                var sid = _data[1];
                cc.log("thinktime : ", thinktime); 
                cc.log("sid: ", sid);
                cc.log("玩家座位号：", this._userdata.sid);
                this.player_seat_time_bar(sid, thinktime); 
                
                /// 控制显示的ui
                if(this._userdata.sid == sid){
                    // 播放倒计时
                    if(this._userdata.is_look){
                        this.ui_layer.getComponent("game_ui_layer").show_ui3(); 
                    }
                    else{
                        this.ui_layer.getComponent("game_ui_layer").show_ui2(); 
                    } 
                }
                else{
                    this.ui_layer.getComponent("game_ui_layer").hide_ui(); 
                }
                break; 

            case ctype.Game.LookCard: 
                if(_data.state != response.OK) { 
                    return; 
                }
                this._userdata.is_look = true;
                
                this.ui_layer.getComponent("game_ui_layer").show_ui3(); 
                this.ui_layer.getComponent("game_ui_layer").show_card(_data.card); 
                cc.log("看牌：", _data.card); 
                break; 

            case ctype.Game.HeelStake: 
                if(_data.state != response.OK) { 
                    return; 
                }
                var sid = _data.sid; 
                var p_wealth = _data.p_wealth;
                var stakes = _data.stakes; 
                var t_stakes = _data.t_stakes; 
                this.ui_layer.getComponent("game_ui_layer").show_stake_bar(stakes, t_stakes);
                this.player_seat_wealth(sid, p_wealth); 
                break; 
            
            case ctype.Game.AddStake: 
                if(_data.state != response.OK) { 
                    return; 
                }
                var sid = _data.sid; 
                var p_wealth = _data.p_wealth;
                var stakes = _data.stakes; 
                var t_stakes = _data.t_stakes; 
                this.ui_layer.getComponent("game_ui_layer").show_stake_bar(stakes, t_stakes);
                this.player_seat_wealth(sid, p_wealth); 
                break; 


            case ctype.Game.ComparCard: 
                cc.log("比牌 ！！！"); 
                if(_data.state != response.OK) { 
                    return; 
                }
                var sid = _data.sid; 
                var nsid = _data.nsid;
                var p_wealth = _data.p_wealth;
                var stakes = _data.stakes; 
                var t_stakes = _data.t_stakes; 
                var cur_point = _data.cur_point; 
                var nxt_point = _data.nxt_point; 

                this.ui_layer.getComponent("game_ui_layer").show_stake_bar(stakes, t_stakes);
                this.player_seat_wealth(sid, p_wealth); 

                this.show_niu_point(sid, cur_point); 
                this.show_niu_point(nsid, nxt_point);

                break;

            case ctype.Game.SettleMent: 
                if(_data.state != response.OK) { 
                    return; 
                }
                this.ui_layer.getComponent("game_ui_layer").show_ui1(); 
                this.ui_layer.getComponent("game_ui_layer").des_pai();
                
                this.req_seat_lst();
                
                break; 
            default:
                break;
        }

    },

    player_seat_time_bar(sid, thinktime){
        var seat = null; 
        for(var k in this.seat_sid){
            if(this.seat_sid[k].getComponent(cc.Label).string == sid){
                seat = this.seat_sid[k].parent; 
                // cc.log(seat);
                seat.getChildByName("seat_time_bar").getComponent("seat_time_bar").start_time(thinktime); 
                break; 
            }
        }
    }, 

    // 更新金钱数 
    player_seat_wealth(sid, wealth){
        var seat = null; 
        for(var k in this.seat_sid){
            if(this.seat_sid[k].getComponent(cc.Label).string == sid){
                seat = this.seat_sid[k].parent; 
                seat.getChildByName("wealth").getComponent(cc.Label).string = "￥"+wealth;
                break; 
            }
        }
    },

    // 显示牛的大小
    show_niu_point(sid, point){
        var sf = this.niu_type[point];
        for(var k in this.seat_sid){
            if(this.seat_sid[k].getComponent(cc.Label).string == sid){
                var seat = this.seat_sid[k].parent;
                var act1 = cc.fadeIn(1.0);  
                var act2 = cc.fadeOut(3.0);
                var seq = cc.sequence(act1, act2); 
                seat.getChildByName("niu_point").getComponent(cc.Sprite).spriteFrame = sf;
                seat.getChildByName("niu_point").zIndex = 1000;  
                seat.getChildByName("niu_point").runAction(seq);
                break; 
            }
        }
    },

    // 离开房间  
    leave_room(data){
        // cc.log(data); 
        if(data.state == response.OK){
            cc.director.loadScene("zone_scene"); 
        }
    }, 

    // 初始化房间
    init_room(){
        this.seat1 = this.seat_root.getChildByName("seat1"); 
        var arr = {
            face: this._userdata.uface, 
            nick: this._userdata.unick, 
            wealth: this._userdata.uwealth, 
            sid: this._userdata.sid, 
        }
        this.updata_seat(this.seat1, arr); 
    },  

    // 刷新房间 
    updata_room(seatlst){
        // cc.log("房间信息：", seatlst); 
        // cc.log("刷新房间信息!!!"); 

        var otherlst = [];

        for(var k in seatlst){

            if(seatlst[k] == null){
                otherlst.push(null); 
            }
            if(seatlst[k] != null){
                if(this._userdata.uid == seatlst[k].uid){
                    continue; 
                }
                else{
                    otherlst.push(seatlst[k]);
                }
            }
        }
        // 删除后
        // cc.log("otherlst", otherlst);

        this.seat2 = this.seat_root.getChildByName("seat2"); 
        if(otherlst[0] != null){
            this.updata_seat(this.seat2, otherlst[0]); 
        } 
        else{
            this.null_seat(this.seat2); 
        } 
        this.seat3 = this.seat_root.getChildByName("seat3"); 
        if(otherlst[1] != null){
            this.updata_seat(this.seat3, otherlst[1]); 
        } 
        else{
            this.null_seat(this.seat3); 
        } 
        this.seat4 = this.seat_root.getChildByName("seat4"); 
        if(otherlst[2] != null){
            this.updata_seat(this.seat4, otherlst[2]); 
        } 
        else{
            this.null_seat(this.seat4); 
        } 
        this.seat5 = this.seat_root.getChildByName("seat5"); 
        if(otherlst[3] != null){
            this.updata_seat(this.seat5, otherlst[3]); 
        } 
        else{
            this.null_seat(this.seat5); 
        } 
    },

    // 座位清空 
    null_seat(seat){
        var head = seat.getChildByName("head"); 
        var nick = seat.getChildByName("nick"); 
        var wealth = seat.getChildByName("wealth"); 
        var sid = seat.getChildByName("sid");
        head.getComponent(cc.Sprite).spriteFrame = this.nullhead; 
        nick.getComponent(cc.Label).string = "空";
        wealth.getComponent(cc.Label).string = "￥0";
        sid.getComponent(cc.Label).string = null; 
    }, 

    // 更新座位
    updata_seat(seat, arr){
        var head = seat.getChildByName("head"); 
        var nick = seat.getChildByName("nick"); 
        var wealth = seat.getChildByName("wealth"); 
        var sid = seat.getChildByName("sid");
        // cc.log("座位信息：  ", arr); 
        sid.getComponent(cc.Label).string = arr.sid; 
        head.getComponent(cc.Sprite).spriteFrame = this.uhead[arr.face]; 
        nick.getComponent(cc.Label).string = arr.nick;
        wealth.getComponent(cc.Label).string = "￥" + arr.wealth;
    }, 

    start () {

    },

    // update (dt) {},
});
