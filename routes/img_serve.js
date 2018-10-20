"use strict";

var config = require('config');
var jwt = require('jwt-simple');
var express = require('express');
var Router = express.Router;

router = Router();
module.exports = router;

var secret = config.get("img_secret");
var host = config.get("img_host")

var create_token = function(){
    var ts = Math.round((new Date()).getTime() / 1000);
    var payload = {
        created_at: ts
    };
    var token = jwt.encode(payload, secret);
    return token;
};

router.get('/auth', function(req, res, next) {
    if (secret === null) {
        res.status(500);
        res.write("not configured");
        res.end();
        return;
    }
    
    var token = create_token();
    
    var url;
    if (host !== null) {
        url = `http://${host}/set_token/${token}`;
    }
    
    var data = {
        token: token,
        url: url,
    };
    
    res.json(data);
})

