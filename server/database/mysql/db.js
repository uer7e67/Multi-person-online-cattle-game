var pool = require("./pool");
var mysql = require("mysql");
var log = require("../../utils/log");

var db = {}; 

db.query = function(sql, args, callback){
	sql = mysql.format(sql, args), 
	pool.getConnection(function(err, connection){
		if(err){
			log.error("Database Connect Error !!!");
			return;
		}
		else{
			connection.query(sql, function(err, res){
				connection.release(); 
				callback(err, res); 
			}); 
		}
	})
}; 

db.updata = db.query;
db.delete = db.query; 
db.insert = db.query; 
db.query = db.query; 

module.exports = db; 
