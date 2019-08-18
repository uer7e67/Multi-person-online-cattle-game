var game_conf = require("../game_conf"); 
var player_state = game_conf.player_state; 

function player(id, key){
    this.uid = id; 
    this.key = key; 

    this.state = player_state.look; 

    this.zid = -1;        // 所在的区号  
    this.rid = -1;        // 房间号
    this.sid = -1;        // 座位号
    
    this.nick = null;
    this.face = 1; 
    this.score = 0;     // 积分  
    this.wealth = 0;   // 财富  
}; 

player.prototype.init = function(uinfo){
    this.nick = uinfo.unick; 
    this.face = uinfo.uface; 
    this.score = uinfo.uscore; 
    this.wealth = uinfo.uwealth; 
}; 

module.exports = player; 
