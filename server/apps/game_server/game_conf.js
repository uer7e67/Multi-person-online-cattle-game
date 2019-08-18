var game_conf = {
    room_state: {
        ready: 0,    // 准备
        playing: 1,   //游戏中 
        checkout: 2 ,  //游戏结算  
    },
    player_state: {
        look: 0,      // 未准备 （旁观） 
        ready: 1,     // 准备状态 
        playing: 2,   // 游戏中
        fail: 3,      // 失败 旁观中
    }, 
}






module.exports = game_conf; 