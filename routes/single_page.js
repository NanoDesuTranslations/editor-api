"use strict";

var express = require('express');
var http = require('http');
var config = require('config');
var Router = express.Router;

router = Router();

module.exports = {router: router};

var active = false;

router.get("/:page_id", function(req, res, next){
    var options = {
        // host to forward to
        host:   config.get('single_page_host'),
        // port to forward to
        port:   config.get('single_page_port'),
        // path to forward to
        path:   '/pi/' + req.params.page_id,
        // request method
        method: 'GET',
        // headers to send
        // headers: req.headers
    };
    
    res.set('Content-Type', 'text/html; charset=utf-8')
    
    var preq = http.request(options, function(pres) {
        pres.on('data', function(chunk){
            res.write(chunk);
        });
        
        pres.on('close', function(){
            res.writeHead(cres.statusCode);
            res.end();
        });
        
        pres.on('end', function(){
            res.end();
        });
    }).on('error', function(e) {
        console.log(e.message);
        res.end("no connection to generator");
    });
      
    preq.end();
});
