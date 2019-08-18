var log = require("../../utils/log");
var zone = require("./module/zone"); 
var room = require("./module/room"); 
var player = require("./module/player"); 
var netbus = require("../../netbus/netbus");
var conf = require("../svr.json"); 
var proto = require("../../netbus/proto_mgr");
var response = require("../respones");
var auth_dao = require("../../database/auth_dao");
var game_conf = require("./game_conf");
var room_state = game_conf.room_state; 
var player_state = game_conf.player_state; 

var SINGLE_COIN = 20;  

// 命令号  
var CMD = {
    EnterZone: 1,           // 进入区间
    LeaveZone: 2,           // 离开区间
    QucickEnterRoom: 3,     // 快速匹配
    EnterRoom: 4 ,          // 进入房间
    LeaveRoom: 5 ,          // 离开房间
    RefrashRoomPlayer: 6,   // 刷新房间内玩家
    Prepare :  7,           // 玩家准备   
    CanclePrepare: 8,       // 取消准备
    SendCard: 9,            // 发牌  
    ReqFrashSeatLst: 10,    // 请求刷新
    TurnToNextPlayer: 11,   // 更换控制权  
    LookCard: 12,           // 看牌    
    ThrowCard: 13,          // 扔掉牌
    HeelStake: 14,          // 跟注
    AddStake: 15,           // 加注
    GameStart: 16,          // 游戏开始
    ComparCard: 17,         // 比牌
    SettleMent: 18,         // 结算
    
}; 

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 分区配置  （最少积分  单次费用  最长思考时间  最少财富）  
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
var zone_conf = {
    0 : { zid : 1, name : "新手场",  min_score : 0, single_cose : 10, think_time: 15, min_wealth : 100},
    1 : { zid : 2, name : "中级场",  min_score : 10, single_cose : 10, think_time: 15, min_wealth : 1000},
    2 : { zid : 3, name : "高级场",  min_score : 100, single_cose : 10, think_time: 15, min_wealth : 5000},
    3 : { zid : 4, name : "大师场",  min_score : 300, single_cose : 10, think_time: 15, min_wealth : 20000},
};

var global_cards = [ 
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13',
];

// 牛类型
var ntype = {
    n0: 0,  
    n1: 1, 
    n2: 2,
    n3: 3,
    n4: 4, 
    n5: 5, 
    n6: 6, 
    n7: 7, 
    n8: 8, 
    n9: 9, 
    nn: 10,
    sn: 11,  // 神牛
};

// 初始化分区
var zone_lst = {}; 

function init_zone(conf, callback){
    for(var i in conf){
        var zid = conf[i].zid; 
        var z = new zone(conf[i]); 
        zone_lst[zid] = z; 
    }
    callback();
};

init_zone( zone_conf, function(){
    log.info("Init Zone Lst ..."); 
}); 

var rid = 1; 

// 牛类型
var ntype = {
    n0: 0,  
    n1: 1, 
    n2: 2,
    n3: 3,
    n4: 4, 
    n5: 5, 
    n6: 6, 
    n7: 7, 
    n8: 8, 
    n9: 9, 
    nn: 10,
};

// 进入分区  
function enter_zone(session, stype, ctype, msg, key){
    var zid = msg.zid;     // 大区号  
    var uid = msg.uid;     // 玩家的id   

    var data ; 
    var body = {}; 

    var p = new player(uid, key); 
    
    // console.log("uid", uid);
    auth_dao.uid_query(uid, function(state, res){

        if(state == response.ERROR){
            log.error("Sql Error ... ");      
            return;  
        }
        // console.log(res);
        p.zid = zid; 
        p.init(res); 
        zone_lst[zid].enter(p, function(s){
            // log.info("结果:"+s);
            body.state = s; 
            body.zid = zid; 
            data = proto.json_encode2(stype, ctype, body, key);
            netbus.SESSION_SEND(session, data);
        });
    })
}

// 离开分区  
function leave_zone(session, stype, ctype, msg, key){
    // msg { zid, uid }
    // console.log(msg);
    var zid = msg.zid; 
    var uid = msg.uid; 

    var data ; 
    var body = {}; 
    
    var zone = zone_lst[zid]; 
    zone.leave(uid, function(state){
        body.state = state; 

        data = proto.json_encode2(stype, ctype, body, key);
        netbus.SESSION_SEND(session, data);
    });
}


// 房间内广播 (r: 房间,   msg: 消息)
function broadcast(session, stype, ctype, body, room){

    var data;
    var slst = room.seat_lst; 
    for(var i = 0; i < slst.length; i ++){

        var player = slst[i]; 
        if(player == null){
            continue; 
        }
        else{
            var key = player.key; 
            data = proto.json_encode2(stype, ctype, body, key);
            netbus.SESSION_SEND(session, data);
        }
    }

    return; 
}

// 请求刷新房间座位
function refrash_room_seat(session, stype, ctype, msg, key){
    // 在该房间内广播座位列表
    var rid = msg.rid; 
    var zid = msg.zid; 
    
    var data = null; 
    var body = {}; 
    var zone = zone_lst[zid]; 

    log.warn(rid, zid);
    // log.error(zone);
    var room = zone.room_lst[rid]; 

    body.seat_lst = room.seat_lst; 

    data = proto.json_encode2(stype, ctype, body, key);
    netbus.SESSION_SEND(session, data);
}

// 快速进入房间 (广播)
function quick_enter_room(session, stype, ctype, msg, key){

    var data = null; 
    var body = {}; 
    var body2 = {}; 

    // recv  msg  { uid, zid } 
    // send  body {       } 
    var uid = msg.uid; 
    var zid = msg.zid; 

    var zone = zone_lst[zid]; 
    var rooms = zone.room_lst; 

    var player = zone.wait_lst[uid]; 

    // console.log("当前房间列表：", rooms); 
    for(var i in rooms){
        if(rooms[i] && rooms[i].empty_seat() >= 1){
            // 
            log.info("Find One Empty Room ！！！"); 
            player.rid = rooms[i].rid; 
            // rid 
            rooms[i].enter(player, function(sid, res){
                if(res == response.OK){
                    log.info("Join Success!!!"); 
                    body = {
                        state: res, 
                        rid: rooms[i].rid, 
                        sid: sid, 
                    }; 
                    // body.state = res;
                    // body.rid = 
                    // body.sid = sid; 
                    player.sid = sid; 
                    log.warn("座位号：", sid);
                    data = proto.json_encode2(stype, ctype, body, key);
                    netbus.SESSION_SEND(session, data); 

                    // 广播
                    body2.seat_lst = rooms[i].seat_lst; 
                    broadcast(session, stype, CMD.RefrashRoomPlayer, body2, rooms[i]); 
                }
                else{
                    log.info("Join Error!!!"); 
                }
            }); 
            return; 
        }

    }
    // 没有搜索到房间  
    var r = new room(rid, zone.conf);
    zone.add_room(r, function(state){
        log.info("没有发现空房间, 创建房间!!"); 
        player.rid = r.rid; 
        r.enter(player,function(sid, res2){
            if(res2 == response.OK){
                // console.log("进入房间成功！！！"); 
                body.state = res2; 
                body.rid = rid;
                body.sid = sid;
                player.sid = sid; 
                data = proto.json_encode2(stype, ctype, body, key);
                netbus.SESSION_SEND(session, data);
            }
        }); 
        rid ++; 
    }); 
    
}

// ##############离开房间
function leave_room(session, stype, ctype, msg, key){
    var data = null; 
    var body = {}; 
    
    // {zid, uid}
    var zid = msg.zid; 
    var uid = msg.uid; 
    var rid = msg.rid; 

    // log.info("离开房间, 接收的参数", msg); 
    var room = zone_lst[zid].room_lst[rid]; 
    // log.error(room.seat_lst);
    var player = null; 
    for(var k in room.seat_lst){

        if(room.seat_lst[k] != null && uid == room.seat_lst[k].uid){
            player = room.seat_lst[k]; 
            break; 
        }
    }

    room.leave(player); 
    zone_lst[zid].enter(player, function(res){
        if(res == response.OK){
            // log.info("返回大厅成功 !!!"); 
            player.sid = -1; 
            body.state = response.OK; 
            data = proto.json_encode2(stype, ctype, body, key);
            netbus.SESSION_SEND(session, data);
    
            broadcast(session, stype, CMD.RefrashRoomPlayer, key, room); 


        }
    })
}
// ##############end


//####################################################################################游戏逻辑部分


/**
 * 发牌 
 * @param num 人数 
 * @param arr 牌的数组
 */
function divide_card(num, arr){
    var p = [];
    var j = 0; 
    var k = 5;
    for(var i = 0; i < num; i++){
        p[i] = arr.slice(j, k); 
        j += 5; 
        k += 5;
    }
    return p; 
} 

/**
 * 格式化牌型 [A1, A2, A3, A4, A5] ==>> [1, 2, 3, 4, 5]; 
 * @param p 牌的数组
 */
function format_card(p){

    var t = [] ; 
    for(var i = 0; i < 5; i++){
        t[i] = parseInt(p[i].substr(1)); 
        if(t[i] > 10){
            t[i] = 10;
        }
    }

    return t; 
}

/**
 * 判断牌型 [1, 2, 3, 4, 5] ==> 5 
 * @param arr 格式化后的数组
 */
function judge_card(_arr){


    var n = 0;  
    var cardall = 0; 
    var cow = 0; 

    var arr = format_card(_arr); 
    // 从大到小排序
    arr.sort(function(a, b){
        return a < b;
    });

    for(var i = 0; i < 5; i++){
        cardall += arr[i];
        if(arr[i] == 10){
            n ++;
        }
    }
    // 1 2 3 4 5
    switch (n) {
        case 0:
            for(var i = 0; i < 4; i ++){
                for(var j = i + 1; j < 5; j ++){
                    if((cardall - arr[i] - arr[j]) % 10 == 0){
                        cow = (arr[i] + arr[j]) % 10;
                        return cow;  
                    }
                }
            }
            break;
        
        case 1:  
            // 10 8 6 5 5
            for(var i = 1; i < 4; i ++){
                for(var j = i + 1; j < 5; j ++){
                    if((arr[i] + arr[j]) % 10 == 0){
                        cow = cardall % 10; 
                        return cow; 
                    }
                }
            }

            // 10 7 5 3 2
            for(var i = 1; i < 5; i ++){
                if((cardall - arr[i])%10 == 0){
                    cow = cardall % 10; 
                    return cow; 
                } 
            }

        case 2: 
            if(cardall % 10 == 0){
                cow = 10; 
            }
            else{
                for(var i = 1; i < 4; i++){
                    for(var j = i + 1; j < 5; j++){
                        if((arr[i] + arr[j]) % 10 == 0){
                            cow = (cardall - arr[j] - arr[i])%10; 
                            return cow; 
                        }
                    }
                }
            }
            break; 
        case 3: 
        case 4: 
        case 5: 
            cow = cardall % 10;
            return cow; 
        default:
            break;
    }
    return cow;
};


// 准备
function determine_prepare(session, stype, ctype, msg, key){
    log.warn("msg")
    // 
    //  msg{ uid, zid, rid }
    var data; 
    var body = {};

    var uid = msg.uid; 
    var zid = msg.zid; 
    var rid = msg.rid;
    //1 判断房价内有这个
    var room = zone_lst[zid].room_lst[rid]; 
    var crnt_num = 5 - room.empty_seat();  // 当前玩家的数量
    for(var k in room.seat_lst){
        if(room.seat_lst[k]!=null && room.seat_lst[k].uid == uid){ 
            room.prepare_num ++;
        }
    }
    //2 房间大于三个人 并且准备的人数和房间内人数一致 游戏开始  
    if(crnt_num >= 2 && room.prepare_num == crnt_num){
        
        room.game_start(function(){
            log.info("游戏开始 !!!"); 
            body.state = response.OK; 
            broadcast(session, conf["game"].stype, CMD.GameStart, body, room); 

        }); 
        // 洗牌 
        var cards = divide_card(crnt_num, global_cards.sort(function(){
            return Math.random() > 0.5 ? -1 : 1;
        }));

        // 存入房间中
        room.save_card(cards, function(arr){
            log.info("房间存放的牌组：", arr);
        }); 
        // end

        var sid = room.find_first_sid();  
        log.info("第一个玩家", sid); 
        setTimeout(function() {
            turn_to_next(session, room, sid); 
        }, 3000);
    }
    else{
        return; 
    }
}

// 取消准备 
function cancle_prepare(){

}

// 转移控制权
function turn_to_next(session, room, sid){
    var data = null; 
    var think_time = room.conf.think_time; 

    if(room.time_handle !== null){
        clearTimeout(room.time_handle); 
        room.time_handle = null; 
    }

    if(room.seat_lst[sid] == null || room.seat_lst[sid].state != player_state.playing){
        return; 
    }

    // 启动定时器 
    room.time_handle = setTimeout(function() {
        // 超时处理   
        room.time_handle = null; 
        var _sid = room.get_next_seat();  
        log.info("下一个玩家的座位是：",_sid); 
        if(_sid == -1){
            return ; 
        }
        turn_to_next(session, room, _sid);
    }, think_time * 1000);

    // 广播
    room.cur_seat = sid; 

    var body = {
        state: response.OK, 
        think_time: think_time, 
        sid: sid,
    }; 
    broadcast(session, conf["game"].stype, CMD.TurnToNextPlayer, body, room); 
}

// 看牌
function look_card(session, stype, ctype, msg, key){

    var zid = msg.zid; 
    var sid = msg.sid; 
    var rid = msg.rid; 
    var zone = zone_lst[zid]; 
    var room = zone.room_lst[rid]; 
    var data = null;

    if(!room){
        return; 
    }

    var body = {
        state: response.OK, 
        card: room.cards[sid], 
    };  

    data = proto.json_encode2(stype, ctype, body, key);
    netbus.SESSION_SEND(session, data);

}

// 结束本回合 
function end_operation(session, stype, ctype, msg, key){
    
    // msg{ rid }
    var zid = msg.zid; 
    var rid = msg.rid; 
    var sid = msg.sid; 
    var zone = zone_lst[zid]; 
    var room = zone.room_lst[rid]; 

    var _sid = room.get_next_seat();  
    turn_to_next(session, room, _sid); 
    if(!room){
        return; 
    }

    var body = {
        state: response.OK, 
    };  

    data = proto.json_encode2(stype, ctype, body, key);
    netbus.SESSION_SEND(session, data);
}

// 跟注  (不用判断结算)
function heel_stake(session, stype, ctype, msg, key){
    
    var zid = msg.zid; 
    var sid = msg.sid; 
    var rid = msg.rid; 

    var zone = zone_lst[zid]; 
    var room = zone.room_lst[rid]; 
    var player = room.seat_lst[sid]; 

    if(!room){
        return; 
    }
    // 获取当前的注大小 
    var stake = room.stakes; 

    if(player.wealth < stake){
        log.error("玩家的钱不足以跟注 ！！！！");
        return;  
    }
    
    player.wealth -= stake; 
    room.total_stakes += stake; 

    log.warn("总赌金 ： ", room.total_stakes); 
    log.warn("单次注 ： ", stake);
    // 广播  
    var body = {
        state: response.OK, 
        sid: sid,                // 座位号
        p_wealth: player.wealth, // 玩家财富  
        stakes: stake,           // 单注大小 
        t_stakes: room.total_stakes,  // 总注金
    };

    broadcast(session, conf["game"].stype, CMD.HeelStake, body, room);

    // 转换控制权
    var _sid = room.get_next_seat();  
    turn_to_next(session, room, _sid); 

}

// 加注 
function add_stake(session, stype, ctype, msg, key){

    var zid = msg.zid; 
    var sid = msg.sid; 
    var rid = msg.rid; 

    var zone = zone_lst[zid]; 
    var room = zone.room_lst[rid]; 
    var player = room.seat_lst[sid]; 

    if(!room){
        return; 
    }
    // 获取当前的注大小 
    room.stakes += 50; 

    if(player.wealth < room.stakes){
        log.error("玩家的钱不足以加注 ！！！！");
        return;  
    }
    
    player.wealth -= room.stakes; 
    room.total_stakes += room.stakes; 

    log.warn("总赌金 ： ", room.total_stakes); 
    log.warn("单次注 ： ", room.stakes);
    // 广播  
    var body = {
        state: response.OK, 
        sid: sid,                     // 座位号
        p_wealth: player.wealth,      // 玩家财富  
        stakes: room.stakes,          // 单注大小 
        t_stakes: room.total_stakes,  // 总注金
    };

    broadcast(session, conf["game"].stype, CMD.AddStake, body, room);

    // 转换控制权
    var _sid = room.get_next_seat();  
    turn_to_next(session, room, _sid); 

}

// 比牌
function compare_card(session, stype, ctype, msg, key){
    // { zid , rid , sid }
    var zid = msg.zid; 
    var sid = msg.sid; 
    var rid = msg.rid; 

    var zone = zone_lst[zid]; 
    var room = zone.room_lst[rid]; 
    var player = room.seat_lst[sid]; 

    if(!room){
        return; 
    }
    // 获取下一个座位号 
    var _sid = room.get_next_seat();    
    if(_sid == -1){
        log.warn("获取不到下一个玩家！！！"); 
        return; 
    }
    var cur_n = room.cards[sid];
    var nxt_n = room.cards[_sid]; 

    log.info("当前座位牌型 ：", judge_card(cur_n));
    log.info("下个座位牌型 ：", judge_card(nxt_n));  

    var cur_point = judge_card(cur_n); 
    var nxt_point = judge_card(nxt_n); 

    // 当前的注大小 
    var stake = room.stakes; 

    room.seat_lst[sid].wealth -= stake;
    room.total_stakes += stake; 

    // 发送比牌结果 
    var body = {
        state: response.OK, 
        sid: sid,                     // 座位号
        p_wealth: player.wealth,      // 玩家财富  
        stakes: room.stakes,          // 单注大小 
        t_stakes: room.total_stakes,  // 总注金
        nsid: _sid, 
        cur_point: cur_point,         // 当前点数  
        nxt_point: nxt_point,         // 下个玩家点数 
    }; 
    broadcast(session, conf["game"].stype, CMD.ComparCard, body, room);
    // end

    // 当前玩家赢了下一个玩家  
    if(cur_point >= nxt_point){
        room.seat_lst[_sid].state = player_state.fail; 
    }
    else{
        room.seat_lst[sid].state = player_state.fail; 
    }

    // 判断能否结算
    if(room.is_settlement()){
        settlement(session, room); 
    }
    else{
        var _nsid = room.get_next_seat();  
        turn_to_next(session, room, _nsid); 
    }

}

// 结算  
function settlement(session, room){

    var total_stakes = room.total_stakes;  // 这盘房间内的钱
    var sucer = room.sucer(); 
    // 根据钱分配  
    
    //
    for(var k in room.seat_lst){
        var player = room.seat_lst[k]; 
        if(player == null){
            continue;
        }
        var uid = player.uid; 
        var wealth = player.wealth; 
        if(k == sucer){
            wealth += total_stakes;
            player.wealth = wealth; 
        }
        auth_dao.save_wealth(uid, wealth, function(state){
            if(state == response.OK){
                log.info("修改成功!!"); 
            }
        }); 
    } 

    if(room.state = game_conf.room_state.playing){
        room.time_handle = null; 
        room.state = game_conf.room_state.ready;  // 重置状态 
    }

    var body = {
        state : response.OK, 
        win_seat: sucer, 
    };
    broadcast(session, conf["game"].stype, CMD.SettleMent, body, room);

}

// 弃置手牌
function throw_card(session, stype, ctype, msg, key){

}

//######################################################################服务模块
var service = {
    name : "Game Server", 
    is_transfer: false ,     // 转发模块

    // 接受客户端消息
    on_recv_client: function (session, stype, ctype, msg, key){

        log.info(this.name, " recv:", stype, ctype, msg);

        switch(ctype){

            case CMD.EnterZone:    // 进入分区 

                if(msg != null){
                    enter_zone(session, stype, ctype, msg, key);
                }
                break; 

            case CMD.LeaveZone:     // 离开分区 

                if(msg != null){
                    leave_zone(session, stype, ctype, msg, key);
                }
                break; 

            case CMD.QucickEnterRoom:   // 快速进入房间       

                if(msg != null){
                    quick_enter_room(session, stype, ctype, msg, key); 
                }
                break; 

            case CMD.EnterRoom:     //进入房间   

                if(msg != null){
                    enter_room(session, stype, ctype, msg, key); 
                }
                break; 
            
            case CMD.LeaveRoom:    // 离开房间  

                leave_room(session, stype, ctype, msg, key);
            

            case CMD.Prepare:     // 准备

                determine_prepare(session, stype, ctype, msg, key); 

                break; 
            
            case CMD.CanclePrepare:    // 取消准备 

                if(!msg){
                    cancle_prepare(); 
                }
                break; 

            case CMD.ReqFrashSeatLst:    // 请求刷新列表 
                refrash_room_seat(session, stype, ctype, msg, key);
                break; 
 
            case CMD.ThrowCard:          // 放弃手牌 
                throw_card(session, stype, ctype, msg, key) ;
                break; 

            case CMD.LookCard:           // 看牌 
                look_card(session, stype, ctype, msg, key); 
                break; 
            
            case CMD.ComparCard:     // 比牌  
                compare_card(session, stype, ctype, msg, key);
                break;
            
            case CMD.HeelStake:         // 跟注 
                heel_stake(session, stype, ctype, msg, key);
                break; 

            case CMD.AddStake:          // 加注 
                add_stake(session, stype, ctype, msg, key);
                break; 

        }
    }, 
    // 接受到服务器端消息
    on_recv_server: function(session, data){

    },
    // 服务被动丢失连接时调用
    on_disconnect: function(session, stype){
        
    }, 
}; 

module.exports = service; 










// 发牌  
// for(var j in room.seat_lst){
//     if(room.seat_lst[j]!= null){
//         var pkey = room.seat_lst[j].key;      
//         data = proto.json_encode2(stype, ctype, body, pkey);
//         netbus.SESSION_SEND(session, data);
//     }
// }


// 规则
// 谁牌最大获得所有赌金  
// 牌相同平分赌金
// 投币 ( 轮播方式 )
// function throw_coin(session, stype, ctype, msg, key){
//     // msg{zid, rid, uid, sid, stake}
//     var zid = msg.zid; 
//     var sid = msg.sid; 
//     var rid = msg.rid; 

//     var room = zone_lst[zid].room_lst[rid]; 
//     if(!room){ 
//         log.warn("房间为空！！！"); 
//         return; 
//     }
//     // 扣除uid的钱
//     var player = room.seat_lst[sid]; 
//     player.wealth -= SINGLE_COIN;
//     // 房间赌金增加
//     room.stakes += SINGLE_COIN; 
//     // 广播   
//     var body = {
//         state: response.OK, 
//         sid: sid, 
//     } ; 

//     broadcast(session, conf["game"].stype, CMD.ThrowCoin, body, room); 
// }