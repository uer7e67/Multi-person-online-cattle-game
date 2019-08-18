var db = require("./mysql/db"); 
var respones = require("../apps/respones"); 
var log = require("../utils/log");

var auth_dao = {};

// 游客登录
auth_dao.gst_login = function(unick, guest_key, callback){
    var sql = "insert into cc_uinfo(unick, guest_key) values (?, ?)"; 
    var args = [unick, guest_key];
    db.insert(sql, args, function(err, res){
        if(err){ 
            log.error("SQL——ERROR: gst_login"); 
            return; 
        }
        else{
            if(res.length <= 0){
                callback(respones.ERROR); 
            }
            else{
                callback(respones.OK);
            }
        }
    });  
}

// 验证帐号信息
auth_dao.uname_query = function(name, callback){
    var sql = "select * from cc_uinfo where uname = ?";   
    var args = [name];
    db.query(sql, args, function (err, res){
        if(err){
            log.error("SQL——ERROR: uname_query"); 
            return; 
        }
        else{
            if(res.length <= 0){
                callback(respones.SQL.EMPTY, null); 
            }
            else{
                // console.log(res);
                callback(respones.SQL.SUCCESS, res[0]); 
            }
        }
    })
}


// 游客查询
auth_dao.gst_query = function(guest_key, callback){
    var sql = "select * from cc_uinfo where guest_key = ?";   
    var args = [guest_key]; 
    db.query(sql, args, function(err, res){
        if(err){
            log.error("SQL——ERROR: gst_query"); 
            return; 
        }
        else{
            if(res.length <= 0){
                callback(respones.SQL.ERROR, null); 
            }
            else{
                // console.log(res);
                callback(respones.SQL.SUCCESS, res[0]); 
            }
        }
    }); 
}

// 通过id号查询玩家信息  
auth_dao.uid_query = function(uid, callback){
    var sql = "select * from cc_uinfo where uid = ?";   
    var args = [uid]; 
    db.query(sql, args, function(err, res){
        if(err){
            log.error("SQL——ERROR: uid_query"); 
            return; 
        }
        else{
            if(res.length <= 0){
                callback(respones.SQL.ERROR, null); 
            }
            else{
                // console.log(res);
                callback(respones.SQL.SUCCESS, res[0]); 
            }
        }
    }); 

}

// 修改玩家金钱
// 结算时候进行修改 
// 每个玩家对象的 金钱存到数据库中  
auth_dao.save_wealth = function(uid, wealth, callback){
    var sql = "update cc_uinfo set uwealth = ? where uid = ?"; 
    var args = [wealth, uid]; 
    db.query(sql, args, function(err, res){
        if(err){
            log.error("SQL——ERROR: save_wealth"); 
            callback(respones.ERROR); 
            return; 
        }
        else{
            if(res.affectedRows == 1){
                log.info("修改成功!!!"); 
            }
            callback(respones.OK); 
        }
    })
}


module.exports = auth_dao; 


// auth_dao.uname_query("test", function(state, res){
//     console.log(state, res);
// });

// auth_dao.save_wealth(1, 6000, function(){

// }); 