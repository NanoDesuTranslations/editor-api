var fs = require('fs');
var auth_keys = JSON.parse(fs.readFileSync('./db/auth.json', 'utf8'));

middleware = function(req, res, next){
  var token = false
  if(req.headers.authorization){
    token = req.headers.authorization
    delete req.headers.authorization
  }else if(req.body.auth){
    token = req.body.auth
    delete req.body.auth
  }
  
  var user = {}
  user.auth = false
  if(!token){
    user.auth = false
  }else{
    if(auth_keys[token]){
        user.auth = auth_keys[token]
    }else{
        user.auth = false
    }
  }
  if(user.auth == false){
    user.auth.view = []
    user.auth.edit = []
    user.auth.admin = false
  }
  
  req.user = user
  next()
}

module.exports = {middleware:middleware}
