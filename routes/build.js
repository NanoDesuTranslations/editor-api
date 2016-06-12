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
    res.end("Already running");
    return;
  }
  
  if(req.user.auth){
    if(config.has('build.type')){
      var type = config.get('build.type');
      if(type == "exec" && config.has('build.cmd')){
        var cmd = config.get('build.cmd');
        var options = {};
        if(config.has('build.cwd')){
          options.cwd = config.get('build.cwd');
        }
        options.detatched = true;
        
        var p;
        if(config.has('build.args')){
          p = spawn(cmd, config.get('build.args'), options);
        }else{
          p = spawn(cmd, [], options);
        }
        active = true;
        p.stdout.on('data', (data) => {
          console.log("out", data.toString());
          res.write(data.toString());
        });
        p.stderr.on('data', (data) => {
          console.log("err", data.toString());
          res.write("stderr\n");
        });
        p.on('close', (code) => {
          console.log("close", code);
        });
        p.on('exit', (code) => {
          console.log('Exit', code);
          active = false;
          res.end("End")
        });
        p.on('error', (err) => {
          console.log('Failed to start child process.', err);
          res.end("Error");
        });
      }
    }
  }
});
