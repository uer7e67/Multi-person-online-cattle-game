


// 加密  
function encrypt_cmd(cmd){
    return cmd; 
}

// 解密  
function decrypt_cmd(cmd){
    return cmd; 
}

// json格式化 
function json_encode(stype, ctype, body){
    var cmd = {}; 
    cmd[0] = stype; 
    cmd[1] = ctype; 
    cmd[2] = body; 
    return JSON.stringify(cmd); 
}

// 
function json_encode2(stype, ctype, body, key)
{
    var cmd = {}; 
    cmd[0] = stype; 
    cmd[1] = ctype; 
    cmd[2] = body; 
    cmd[3] = key;
    return JSON.stringify(cmd); 
}


// json 解析  
function json_decode(cmd_json){
    return JSON.parse(cmd_json);   
}

var proto_mgr = {
    encrypt_cmd: encrypt_cmd, 
    decrypt_cmd: decrypt_cmd, 
    json_encode: json_encode,
    json_decode: json_decode, 
    json_encode2: json_encode2,
}; 

module.exports = proto_mgr; 