const fs = require('fs');
const restify = require('restify');

const root="fs";

const hideReg=/^[^.]/;
const audioReg=/(\.txt$)|(\.mp3$)|(\.wav$)/;

//generates list of files matching regex
function recursiveDir(path,reg,inc){
    let ret = [];
    try{
        let files = fs.readdirSync(path);
        files.forEach(file => {
            if(file.charAt(0)!='.'){
                let fPath=path+'/'+file;
                let fStats=fs.lstatSync(fPath);
                if(fStats.isDirectory()){
                    if(inc){
                        ret.push({'fileName': file,'type':'DIR','path':fPath.substring(root.length),'files':recursiveDir(fPath)});
                        //ret[file]={'type':'DIR','path':fPath,'files':recursiveDir(fPath)};
                    }else{
                        ret.concat(recursiveDir(fPath,reg,inc));
                    }
                }else{
                    if(file.match(reg)){
                        console.log("match?");
                        ret.push({'fileName': file,'type':'FILE','path':fPath.substring(root.length)});//, 'id':fStats.ino});
                        //ret[file]={'type':'FILE','path':fPath};
                    }
                }
            }            
        });
    }catch(err){
        console.log(err);
    }
    return ret;
}

//Functions for fs Route
function genFS(path,res){
    try{
        res.send(recursiveDir(path, hideReg, true));
    }catch(err){
        console.log(err);
        res.send(err);
    }
}

function serveFile(relativePath,res){
    console.log('?');
    res.header('content-type','application/octet-stream');
    res.header('content-disposition', 'attachment');
    try{
        fs.createReadStream(relativePath).pipe(res);
    }catch(err){
        console.log(err);
    }
}

function fsController(req,res,next){
    let relativePath=req.url.substring(1);
    if(req.url.charAt(req.url.length-1) === '/'){
        relativePath= req.url.substring(1,req.url.length-1);
        console.log(req.url.length);
    }
    try{
        if(fs.lstatSync(relativePath).isDirectory()){
            genFS(relativePath,res);
        }else{
            serveFile(relativePath,res);
        }
    }catch(err){
        console.log(err);
        res.send("Server Error");
    }
    next();
}
//Done with fs Route



//functions for music route
function listMusic(res){
    try{
        let ret = recursiveDir(root,audioReg,false);
        for(let i = 0;i<ret.length;i++){
                //synchronously add duration to this... gotta find a library
        }
        res.send(ret);
    }catch(err)
    {
        console.log(err);
    }
}

function serveMusic(res,path){
    try{
        let match = path.match(audioReg);
        console.log(match);
        if(match){
            switch(match[0]){
                case '.wav':res.header('content-type','audio/wav');break;
                case '.mp3':res.header('content-type','audio/mpeg');break;
            }
            fs.createReadStream(root+path).pipe(res);
        }
    }catch(err)
    {

    }
}


function musicController(req,res,next){
    console.log(req.url);
    try{
        if(req.url==='/music'){
            listMusic(res);
        } else{
            console.log(req.url.substring(6));
            serveMusic(res,req.url.substring(6));
        }
    }catch(err){
        res.send(err);
        console.log("music controller error");
    }
    next();
}

var file_server = restify.createServer();
file_server.get('/fs.*/',fsController);
file_server.get('/music.*/',musicController);

file_server.listen(8080,function(){
    console.log('%s listening at %s', file_server.name, file_server.url);
})