const fs = require('fs');
const restify = require('restify');

const root="fs";

function recursiveDir(path){
    let ret = {};
    try{
        let files = fs.readdirSync(path);
        files.forEach(file => {
            if(file.charAt(0)!='.'){
                let fPath=path+'/'+file;
                if(fs.lstatSync(fPath).isDirectory()){
                    ret[file]=recursiveDir(fPath);
                }else{
                    ret[file]=fPath;
                }
            }            
        });
    }catch(err){
        console.log(err);
    }
    console.log(Object.keys(ret));
    return ret;
}
function genFS(path,res,next){
    try{
        res.send(recursiveDir(path));
    }catch(err){
        console.log(err);
        res.send(err);
    }
    next();
}

function serveFile(relativePath,res,next){
    res.header('content-type','application/octet-stream');
    res.header('content-disposition', 'attachment');
    try{
        fs.createReadStream(relativePath).pipe(res);
    }catch(err){
        console.log(err);
    }
    next();

}

function fsController(req,res,next){
    let relativePath=req.url.substring(1);
    if(req.url.charAt(req.url.length-1) === '/'){
        relativePath= req.url.substring(1,req.url.length-1);
        console.log(req.url.length);
    }
    try{
        if(fs.lstatSync(relativePath).isDirectory()){
            genFS(relativePath,res,next);
        }else{
            serveFile(relativePath,res,next);
        }
    }catch(err){
        console.log(err);
        res.send("Server Error");
        next();
    }
}

var file_server = restify.createServer();
file_server.get('/fs/:path.*/',fsController);

file_server.listen(8080,function(){
    console.log('%s listening at %s', file_server.name, file_server.url);
})