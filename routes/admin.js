var express = require("express");
var Router = express.Router;

var User = require("../models/user.js");
var auth = require("../auth.js");

var router = Router();
module.exports = router;

router.use(function(req, res, next) {
  if (!req.user.auth.admin) {
    res.status(401);
    res.end();
    return;
  }
  next();
});

router.get("/users", function(req, res, next) {
  var query = {};
  User.find(query, function(err, users) {
    if (err) return next(err);

    resp_users = [];

    for (var user_i in users) {
      var user = users[user_i];

      resp_users.push({
        username: user.username,
        perms: user.perms
      });
    }
    res.json({ users: resp_users });
  });
});

router.post("/users", function(req, res, next) {

  reqParams = ["username", "password", "permissions"];

  if (req.body.username === undefined || req.body.password === undefined || req.body.permissions === undefined) {
    res.status(400);
    res.end(`Missing required parameters check sent request ${reqParams}`);
  }

  auth.hash_password(req.body.password, function(password_hash) {
    var new_user = {
      username: req.body.username,
      password_hash: password_hash,
      perms: req.body.permissions
    };

    User.create(new_user, function(err, user) {
      if (err) return next(err);
      res.json(user);
    });
  });
});

router.put("/users", function(req, res, next) {
  if (req.body.username === undefined) {
    res.status(400);
    res.end("Username required");
    return;
  }

  auth.hash_password(req.body.password, function(password_hash){
    var update_user = {};
    if (password_hash !== undefined) {
      update_user.password_hash = password_hash;
    }
    if (req.body.permissions !== undefined) {
      update_user.perms = req.body.permissions;
    }

    var query = {username: req.body.username};
    User.findOneAndUpdate(query, update_user, function(err, user) {
      if (err) return next(err);
      res.json(user);
    });
  });
});

router.delete("/users/:username", function(req, res, next){
  if (req.params.username === undefined) {
    res.status(400);
    res.end("Username required");
    return;
  }

  var query = { username: req.params.username };
  User.findOneAndRemove(query, function (err, user) {
    if (err) return next(err);
    res.json(user);
  });
});
