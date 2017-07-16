var express = require('express')
var Router = express.Router;

var Series = require('../models/series.js');
var Page = require('../models/page.js');
var wpcom = require('wpcom')();
router = Router();

router.get('/:series/:site', function (req, res, next) {
  console.log('Starting to get posts');
  Series.findOne({ '_id': req.params.series },
    function (err, series) {
      if (err) {
        return next(err);
      }
      console.log(series);
      getPosts(req.params.site)
        .then(result => {
          let pages = new Map();
          let posts = result.filter(x => x.type == 'post');
          let pagesArray = result.filter(x => x.type == 'page');

          pagesArray.forEach(function (element) {
            element.children = [];
            pages.set(element.ID, element);
          }, this);

          for (var [k, v] of pages) {
            if (v.parent) {
              pages.get(v.parent.ID).children.push(v);
            }
          }

          posts.forEach(x => {
            createPost(series, x);
          });

          res.json(pagesArray);
        })
        .catch(next);
    });
});

var createPost = function(series, data) {
  let insert = { 
    content: data.content,
    series: series.id,
    meta: { 
     title: data.title,
     nav_title: data.slug,
     status: 9,
     created: Math.floor(new Date() / 1000),
     updated: null,
     deleted: false,
     blog: { 
       pinned: 0, 
       published_date: new Date(data.date).getTime() / 1000,
       author: 'demo' 
      } 
    } 
  };
  Page.create(insert);
}

var getPosts = function (site) {
  let promise = new Promise((resolve, reject) => {
    let blog = wpcom.site(site);
    let result = [];
    blog.postsList({ type: 'any', number: 100, fields: "ID,title,date,content,slug,type,parent,menu_order" })
      .then(result => {
        // TODO: handle blogs with postcount over 100
        resolve(result.posts);
      })
      .catch(error => reject(error));
  });
  return promise;
}

module.exports = router;
