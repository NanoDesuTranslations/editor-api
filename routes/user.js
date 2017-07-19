var express = require("express");
var Router = express.Router;

var User = require("../models/user.js");
var auth = require("../auth.js");

router = Router();
module.exports = router;

router.post("/login", function (req, res, next) {
  var username = req.body.username || false;
  var password = req.body.password || false;

  if (username === false || password === false) {
    res.status(400);
    res.end("Invalid Request");
    return;
  }

  var query = {username: username};
  User.findOne(query, function (err, user) {
    if (err) return next(err);
    if (!user) {
      res.status(401);
      res.end("Invalid login.");
      return;
    }

    var hash = user.password_hash;
    auth.check_password(password, hash, function (password_valid) {
      if (!password_valid) {
        res.status(401);
        res.end("Invalid login.");
        return;
      }

      var token = auth.create_token(user);
      res.json({
        permissions: user.perms,
        token: token
      });
    });
  });
});
