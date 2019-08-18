var ctype = {

    auth: {
        guest_login: 1,
        formal_login:2, 
        vx_login: 3, 
        forgetpwd: 4, 
    },

    Hall: {
        RedeemCode : 1,         // 兑换码
        LoginAward : 2,         // 登录奖励
    },

    Talkroom: {

    },
 
    Game: {
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
    }
}; 

module.exports = ctype; 