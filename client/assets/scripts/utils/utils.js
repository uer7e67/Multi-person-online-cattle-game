var crypto = require("crypto");

var utils = {
    // ###############加密
    base64_encode: base64_encode, 
    base64_decode: base64_decode, 
    md5: md5, 
    sha1: sha1, 

    // ###############随机 
    ran_str: ran_str, 
    ran_num: ran_num,   
    ran_int: ran_int,      

    // ###############时间戳
    timestamp: timestamp,  
    timestamp_today: timestamp_today, 
    timestamp_yesterday: timestamp_yesterday, 
    timestamp2date: timestamp2date,
    date2timestamp: date2timestamp,
};

// base64 
function base64_encode(data){
    var buf = new Buffer(data); 
    var base64 = buf.toString("base64");
    return base64; 
}

function base64_decode(data){
    var buf = new Buffer(data, "base64"); 
    return buf; 
}

// md5 
function md5(data){
    var md5 = crypto.createHash("md5");
    md5.update(data); 
    return md5.digest("hex");
}

// sha1  
function sha1(data){
    var sha1 = crypto.createHash("sha1"); 
    sha1.update(data); 
    return sha1.digest("hex");
}


// 随机一个字符串  
function ran_str (len){
    var base_char = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789";
    var bc_lent = base_char.length; 
    var str = ""; 
    for(var i=0; i<len; i++){
        str += base_char.charAt(Math.floor(Math.random()*bc_lent));
    } 
    return str ; 
}

    // 随机一个数串
function ran_num (len){
    var base_num = "0123456789"; 
    var bc_lent = base_num.length; 
    var num = ""; 
    for(var i=0; i<len; i++){
        str += base_num.charAt(Math.floor(Math.random() * bc_lent));
    }
    return num; 
}

// 随机一个范围内的数 
function ran_int(min, max){
    var num = Math.floor(Math.random()*max + min);
    return num ; 
} 


// 返回当前时间戳 
function timestamp(){
    var date = new Date();
    var time = Date.parse(date); // 1970 - now 
    time = time/1000; 
    return time ; 
}

// 返回今天 00: 00 : 00 的时间戳 
function timestamp_today(){
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0); 
    date.setSeconds(0); 

    var time = Date.parse(date); 
    return time/1000;
}

// 返回昨天的时间戳 
function timestamp_yesterday(){
    var time = timestamp_today();
    return time - 60 * 60 * 24; 
}

// 时间戳转日期  
function timestamp2date(time){
    var date = new Date();
    date.setTime(time * 1000); // 设置为当前时间 
    return [
        date.getFullYear(),
        date.getMonth()+1, 
        date.getDate(), 
        date.getHours(), 
        date.getMinutes(), 
        date.getSeconds(),
    ]; 
}

// 日期转时间戳  格式  "2017-06-28 18:00:00"
function date2timestamp(strtime){
    var date = new Date(strtime.replace(/-/g, '/'));
    var time = Date.parse(date);
    return (time/1000);  
}


// 转带0的id号
function num2id(num, place){
    var str1 = ""; 
    for(var i=0;i<place;i++){
        str1 += '0';
    }
    str1 += num; 
    str1 = str1.substr(str1.length - place);
    return str1;
}


// console.log(num2id(1199, 4));


function str2json(name, pwd){
    return JSON.stringify(name, pwd)
}
// json序列化后 不能直接用这个属性
// var str = str2json({name:"haoren",pwd: "123"});
// console.log(str.name); 

// var str2 = {name:"haoren",pwd: "123"}; 
// console.log(str2.name);




module.exports = utils; 