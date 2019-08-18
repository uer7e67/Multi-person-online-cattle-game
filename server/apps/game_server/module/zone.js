var log = require("../../../utils/log");
var room = require("./room");
var response = require("../../respones");
// 
function zone(conf){
    this.conf = conf; 
    this.wait_lst = {};     // 等待列表  
    this.room_lst  = {};      // 房间列表
    // this.rid = 1 ;          // 房间号 
};

// 进入分区  
zone.prototype.enter = function(p, callback){
   // 0 : { zid : 0, name : "新手场",  min_score : 0, single_cose : 10, think_time: 15, min_wealth : 100},
   // 条件 
    if(p.score < this.conf.min_score){
        callback(response.ERROR); 
        return; 
    }
    if(p.wealth <  this.conf.min_wealth){
        callback(response.ERROR); 
        return; 
    }

    // 
    p.zid = this.conf.zid; 
    this.wait_lst[p.uid] = p; 
    callback(response.OK); 
    // log.info(this.wait_lst); 
}; 

// 离开分区   
zone.prototype.leave = function(uid, callback){
    this.wait_lst[uid] = null; 
    delete this.wait_lst[uid];
    callback(response.OK);
};

// 增加一个新房间  
zone.prototype.add_room = function(r, callback){
    this.room_lst[r.rid] = r; 
    callback(response.OK); 
}; 

// 移除一个空房间  
zone.prototype.delete_room = function(rid){

}; 

module.exports = zone; 






// // 分配房间
// zone.prototype.assign_room = function(){
//     for(var key in this.wait_lst){
//         var p = this.wait_lst[key]; 
        
//         // 查找一个有座位的房间  
//         var room = null; 
//         for(var i in this.room_lst){
//             if(this.room_lst[i] && this){
//                 room = this.room_lst[i]; 
//             }
//         }        
//         // end  

//         if(room){
//             this.wait_lst[key] = null; 
//             room.enter(p); 
//         }
//     }
// }; 

// function search_room(zone){
//     var r = null; 
//     for(key in zone.room_lst){
//         if(zone.room_lst[key] && zone.room_lst[i].empty_seat >=1){
//             room = zone.room_lst[i];    
//             return room; 
//         }
//     }
//     r = new room(zone.rid, )
// }
