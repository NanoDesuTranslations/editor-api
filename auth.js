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

create_session = function(user){
  var payload = {
    username: user.username,
    created: Date.now()
  };
  var token = jwt.encode(payload, secret);
  sessions[user.username] = token;
  return token;
};

check_session = function(user, token){
  var payload;
  try{
    payload = jwt.decode(token, secret);
  }catch(e){
    return false;
  }
  if(payload.username != user){return false;}
  return true;
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
  
  var user = {};
  user.auth = false;
  if(!token){
    user.auth = false;
  }else{
    if(auth_keys[token]){
        user.auth = auth_keys[token];
    }else{
        user.auth = false;
    }
  }
  if(user.auth === false){
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
  create_session: create_session,
  check_session: check_session
};
