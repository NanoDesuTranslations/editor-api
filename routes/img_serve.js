"use strict";

var config = require('config');
var jwt = require('jwt-simple');
var express = require('express');
var Router = express.Router;

router = Router();

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

let auth_ui = function(req, res, next) {
    let data = `
<script>
fetch('./auth', {headers: {'Authorization': localStorage.getItem('token')}})
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data);
        return data;
    })
    .then(function(data) {
        var elem = document.createElement("a");
        elem.setAttribute('href', data.url);
        elem.setAttribute('target', '_blank');
        elem.innerText = "CLICK HERE";
        document.body.appendChild(elem);
    });
</script>
"user interface"
`
    
    res.end(data);
};

router.get('/auth_ui', auth_ui);

module.exports = {
    'router': router,
    'auth_ui': auth_ui,
};
