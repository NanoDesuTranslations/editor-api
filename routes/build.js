var express = require('express');
var config = require('config');
var spawn = require('child_process').spawn;
var Router = express.Router;

router = Router();

module.exports = router;

var active = false;

router.get("/", function(req, res, next){
  "use strict";
  if(active){
    res.end("no");
    return;
  }
  res.end("k");
  
  if(req.user.auth){
    if(config.has('build.type')){
      var type = config.get('build.type');
      if(type == "exec" && config.has('build.path')){
        var path = config.get('build.path');
        var p;
        if(config.has('build.args')){
          p = spawn(path, config.get('build.args'));
        }else{
          p = spawn(path, [], {detached:true});
        }
        active = true;
        p.stdout.on('data', (data) => {
          console.log("out", data.toString());
        });
        p.stderr.on('data', (data) => {
          console.log("err", data.toString());
        });
        p.on('close', (code) => {
          console.log("close", code);
        });
        p.on('exit', (code) => {
          console.log('Exit', code);
          active = false;
        });
        p.on('error', (err) => {
          console.log('Failed to start child process.', err);
        });
      }
    }
  }
});
