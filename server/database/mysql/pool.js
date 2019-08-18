var mysql = require('mysql');
var conf = require("../db.json"); 
var cd = conf["center_database"];

// 创建连接池 
var pool = mysql.createPool(
	{
		host: cd.host, 
		port: cd.port, 
		user: cd.uname, 
		password: cd.upwd,  
		database: cd.db_name, 
	}
); 


module.exports = pool; 