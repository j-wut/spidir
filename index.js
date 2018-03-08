const fs = require('fs');
const http = require('http');
const url = require('url');

http.createServer(function(req,res){
    var reqParams = url.parse(req.url, true).query;
    console.log(reqParams);
    fs.readdir('blank',function(err,data){
        data.forEach(file =>{
            res.write(file);
        });
        res.write(JSON.stringify(reqParams));
        res.end();
    });
}).listen(9812);
//https://gist.github.com/dtrce/1204243