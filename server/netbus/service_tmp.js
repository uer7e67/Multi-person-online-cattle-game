var service = {
    name : "service tempate", 
    is_transfer: false ,     // 转发模块

    // 接受客户端消息
    on_recv_client: function (session, stype, ctype, msg){

    }, 
    // 接受到服务器端消息
    on_recv_server: function(session, data){

    },
    // 服务被动丢失连接时调用
    on_disconnect: function(session, stype){

    }, 
}; 


module.exports = service; 