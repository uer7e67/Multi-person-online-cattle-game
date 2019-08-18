var express = require("express"); 
var path = require("path");
var crypto = require('crypto');
var app = express(); 

var log = require("../utils/log"); 

app.use(express.static(path.join(process.cwd(), "www"))); 
app.listen(6080, function(){
    log.info("webserver start ... 6080");
}); 