// 返回值
var response = {
    OK: 1, 
    ERROR: -1, 
    INVALID_PARAMS: -100,   // 非法参数
    SQL: {
        SUCCESS: 200,       // 查询成功
        ERROR: 201,         // 查询失败
        EMPTY: 202,         // 查询结果为空
    },
    AUTH: {
        UNEXIT: 203,        // 帐号不存在
        ERRPWD: 204,        // 密码错误
    },
}


module.exports = response; 