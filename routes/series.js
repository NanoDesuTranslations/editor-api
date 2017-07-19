var express = require("express");
var Router = express.Router;

var Series = require("../models/series.js");

router = Router();

router.use(function (req, res, next) {
  if (!req.user.auth.admin) {
    res.status(400);
    res.end();
    return;
  }
  next();
});

router.get("/", function (req, res, next) {
  Series.find(
    function (err, pages) {
      if (err) return next(err);
      res.json(pages);
    }
  );
});

router.post("/", function (req, res, next) {
  Series.create(req.body,
    function (err, post) {
      if (err) return next(err);
      res.json(post);
    }
  );
});

router.get("/:id", function (req, res, next) {
  Series.findOne({"_id": req.params.id},
    function (err, post) {
      if (err) return next(err);
      res.json(post);
    }
  );
});

router.put("/:id", function (req, res, next) {
  Series.findOneAndUpdate({"_id": req.params.id}, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

router.delete("/:id", function (req, res, next) {
  Series.findOneAndRemove({"_id": req.params.id}, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
