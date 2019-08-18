var log = require("../../../utils/log");
var response = require("../../respones");
var game_conf = require("../game_conf"); 
var room_state = game_conf.room_state; 
var player_state = game_conf.player_state; 

var MAX_SEAT = 5;    
// 房间的构造函数  
function room(rid, conf){
    this.conf = conf ;       // 配置
    this.rid = rid ;         // 房间号  
    this.zid = null;         // 区号 
    this.seat_lst = [];      // 座位列表
    this.prepare_num = 0;    // 准备人数
    this.state = room_state.ready; // 默认为待准备状态
    this.cur_seat = -1;      // 当前操作的人
    this.cards = {};         // 牌组  
    this.time_handle = null; // 定时器 
    this.banke = -1;         // 庄家座位号
    this.total_stakes = 0;   // 总的注大小 
    this.stakes = 10;        // 注
    // 预制座位
    for(var i = 0 ; i < MAX_SEAT; i++){
        this.seat_lst.push(null);
    }
}

room.prototype.save_card = function(card_arr, cb){
    // { 座位号 : 牌组 }
    log.info("洗好的牌：",card_arr);
    for(var k in this.seat_lst){
        if(this.seat_lst[k] != null){
            this.cards[k] = card_arr[0];
            card_arr.shift();  
        }
    }
    cb(this.cards); 
}


// 重置数据   
room.prototype.game_start = function(callback){
    // 设置状态
    this.state = room_state.playing; 
    for(var k in this.seat_lst){
        if(this.seat_lst[k] != null){
            this.seat_lst[k].state = player_state.playing;
        }
    }
    this.prepare_num = 0; 
    this.time_handle = null; 
    this.cur_seat = -1;     // 
    this.total_stakes = 0;  // 清空赌金   
    this.stakes = 10;       // 重置注的大小  
    this.cards = {} ;       // 清空牌组 
    callback();
}; 

// 判断能否结算
room.prototype.is_settlement = function(){
    var i = 0;
    for(var k in this.seat_lst){
        var player = this.seat_lst[k]; 
        if(player != null && player.state == player_state.playing){
            i ++; 
        }
    }
    if(i == 1){
        return true; 
    }
    else{
        return false;
    }
}

// 返回胜利的玩家  
room.prototype.sucer = function(){
    for(var k in this.seat_lst){
        var player = this.seat_lst[k]; 
        if(player != null && player.state == player_state.playing){
            this.seat_lst[k].state = player_state.look;
            return k; 
        }
    }
}; 

// 玩家进入房间
room.prototype.enter = function(p, callback){

    if(p.score < this.conf.min_score){
        callback(null, response.ERROR); 
        return; 
    }
    if(p.wealth <  this.conf.min_wealth){
        callback(null, response.ERROR); 
        return; 
    }

    for(var i = 0 ; i < MAX_SEAT ; i++){
        if(this.seat_lst[i] == null){
            this.seat_lst[i] = p;  
            callback(i, response.OK); 
            return; 
        }
    }
};

// 根据sid找到uid 
room.prototype.sid2uid = function(sid){
    if(this.seat_lst[sid] != null){
        return this.seat_lst[sid].uid; 
    }
}

// 玩家离开房间
room.prototype.leave = function(p){
    var sid = p.sid; 
    if(this.seat_lst[sid]!= null && this.seat_lst[sid] == p){
            this.seat_lst[sid] = null; 
    }
}; 

// 房间空位
room.prototype.empty_seat = function(){
    var empty_seat_num = 0 ; 
    for(var i = 0; i < MAX_SEAT; i ++){
        if(this.seat_lst[i] == null){
            empty_seat_num ++; 
        }
    }
    return empty_seat_num;
};


// 房间可以开始游戏的判断 (1 房间大于三个人 2 所有人都准备了)
// 如果  
room.prototype.player_num = function(){
    var num; 
    for(var i = 0; i < MAX_SEAT; i ++){
        if(this.seat_lst[i] != null){
            num ++; 
        }
    }
    return num; 
}

// 找到第一个座位号（之后改成随机的座位号 更公平一点）
room.prototype.find_first_sid = function(){
    for(var k in this.seat_lst){
        if(this.seat_lst[k] != null){
            this.cur_seat = k; 
            return k; 
        }
    }
}

// 返回钱的数组
room.prototype.arr_wealth = function(){
    var arr = new Array(5); 
    for(var i in this.seat_lst){
        arr[i] = this.seat_lst[i].wealth; 
    } 
    return arr; 
}

// 获取到下一个玩家座位号
room.prototype.get_next_seat = function(){
    log.info("当前座位号：", this.cur_seat);
    var e =  parseInt(this.cur_seat + 1)  ; 
    // 情况一 0 
    for(var i = e; i < MAX_SEAT; i ++){
        if(!this.seat_lst[i] || this.seat_lst[i].state != player_state.playing){
            continue; 
        }
        return i ; 
    }

    for(var j = 0; j < this.cur_seat; j ++){
        if(!this.seat_lst[j] || this.seat_lst[j].state != player_state.playing){
            continue; 
        }
        return j ; 
    }
    return -1; 
}

module.exports = room;
