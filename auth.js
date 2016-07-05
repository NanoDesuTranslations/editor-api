var fs = require('fs');
var config = require('config');
var auth_keys = JSON.parse(fs.readFileSync('./db/auth.json', 'utf8'));
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');

var secret = config.get("secret");
if(!secret){
  console.log("No secret set, this is insecure.");
  secret = "Out of sight, out of mind";
}

hash_password = function(password, callback){
  bcrypt.hash(password, 10, function(err, hash) {
    callback(hash);
  });
};

check_password = function(password, hash, callback){
  bcrypt.compare(password, hash, function(err, res) {
    callback(res);
  });
};

create_token = function(user){
  var payload = {
    username: user.username,
    permissions: user.perms,
    created: Date.now()
  };
  var token = jwt.encode(payload, secret);
  return token;
};

decode_token = function(token){
  var payload;
  try{
    payload = jwt.decode(token, secret);
  }catch(e){
    return false;
  }
  return payload;
};

middleware = function(req, res, next){
  var token = false;
  if(req.headers.authorization){
    token = req.headers.authorization;
    delete req.headers.authorization;
  }else if(req.body.auth){
    token = req.body.auth;
    delete req.body.auth;
  }
  
  var payload = decode_token(token);
  
  if(!payload){
    res.status(401);
    res.end("Token invalid");
  }
  
  var user = {};
  
  if(payload.permissions){
    user.auth = payload.permissions;
  }else{
    user.auth.view = [];
    user.auth.edit = [];
    user.auth.admin = false;
  }
  
  req.user = user;
  next();
};

module.exports = {
  middleware: middleware,
  hash_password: hash_password,
  check_password: check_password,
  create_token: create_token,
  decode_token: decode_token
};
