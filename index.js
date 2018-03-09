const fs = require('fs');
const restify = require('restify');

const root="fs";

function recursiveDir(path){
    let ret = [];
    try{
        let files = fs.readdirSync(path);
        files.forEach(file => {
            if(file.charAt(0)!='.'){
                let fPath=path+'/'+file;
                if(fs.lstatSync(fPath).isDirectory()){
                    ret.push({file:recursiveDir(fPath)});
                    //ret[file]=recursiveDir(fPath);
                }else{
                    ret.push(file);
                    //[file]=null;
                }
            }            
        });
    }catch(err){
        console.log(err);
    }
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
function fsController(req,res,next){
    let relativePath = req.url.substring(1);
    try{
        if(fs.lstatSync(relativePath).isDirectory()){
            genFS(relativePath,res,next);
        }else{
            serveFile(relativePath,res,next);
        }
    }catch(err){
        console.log(err);
        res.send(err);
    }
}

var file_server = restify.createServer();
file_server.get('/fs/:path.*/',fsController);

file_server.listen(8080,function(){
    console.log('%s listening at %s', file_server.name, file_server.url);
})