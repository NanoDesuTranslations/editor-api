var express = require('express')
var Router = express.Router;

var Page = require('../models/page.js')
var Series = require('../models/series')

function getSeries(pages, callback){//callback(err, series)
  var query = {}
  if(Array.isArray(pages)){
    var series = new Set()
    pages.forEach( function(page, i){
      if(page.series){
        series.add(page.series)
      }
    })
    series = Array.from(series)
    
    query._id = {$in:series}
  }else{
    query._id = pages.series
  }
  
  Series.findOne(query,
    function (err, series) {
      if (err){
        callback(err, [])
        return;
      }
      //res.json(post);
      callback(false, series)
    }
  );
}

router = Router()

router.get('/old', function(req, res, next) {
  Page.find({}, {content:0},
  //Page.find({series:2}, {content:0},
    function (err, pages) {
      if (err) return next(err);
      res.json(pages);
    }
  );
});

router.post('/old', function(req, res, next) {
  //req.body.id = cur_id++;
  Page.create(req.body,
    function (err, post) {
      if (err) return next(err);
      res.json(post);
    }
  );
});

router.get('/', function(req, res, next) {
  var query = {};
  if(!req.user.auth.admin){
    perm = req.user.auth.view
    if(!perm){
      res.status(400)
      res.json({})
      return
    }
    query.series = {$in:perm}
  }
  
  Page.find(query, {content:0},
  //Page.find({series:2}, {content:0},
    function (err, pages) {
      if (err) return next(err);
      getSeries(pages, function(err, series){
        if(err) return next(err);
        var data = {pages:pages, series:series}
        res.json(data);
      })
    }
  );
});

router.post('/', function(req, res, next) {
  perm = req.user.auth.edit
  var authOk = req.body.series && req.body.series !== undefined && perm.indexOf(req.body.series) !== -1
  authOk = authOk || req.user.auth.admin
  if(!authOk){
    res.status(400)
    res.json({})
    return
  }
  
  Page.create(req.body,
    function (err, page) {
      if (err) return next(err);
      res.json(page);
    }
  );
});

router.get('/:id', function(req, res, next) {
  var query = {'_id':req.params.id}
  if(!req.user.auth.admin){
    if(!req.user.auth.view){
      res.status(400)
      res.json({})
      return
    }
    query.series = {$in:req.user.auth.view}
  }
  
  Page.findOne(query,
    function (err, page) {
      if (err) return next(err);
      getSeries(page, function(err, series){
        if(err) return next(err);
        console.log(page)
        res.json({page:page, series:series});
      })
    }
  );
});

router.put('/:id', function(req, res, next) {
  var query = {'_id':req.params.id}
  if(!req.user.auth.admin){
    if(!req.user.auth.edit){
      res.status(400)
      res.json({})
      return
    }
    query.series = {$in:req.user.auth.edit}
  }
  
  Page.findOneAndUpdate(query, req.body, function (err, page) {
    if (err) return next(err);
    if(!page){
      res.status(400)
      res.json({})
      return
    }
    res.json(page);
  });
});

router.delete('/:id', function(req, res, next) {
  var query = {'_id':req.params.id}
  if(!req.user.auth.admin){
    if(!req.user.auth.edit){
      res.status(400)
      res.json({})
      return
    }
    query.series = {$in:req.user.auth.edit}
  }
  
  Page.findOneAndRemove(query, req.body, function (err, page) {
    if (err) return next(err);
    res.json(page);
  });
});

module.exports = router
