var express = require('express')
var Router = express.Router;

var Series = require('../models/series.js');
var Page = require('../models/page.js');
var wpcom = require('wpcom')();
router = Router();

router.get('/:series/:site', function (req, res, next) {
  console.log('Starting to get posts');
  Series.findOne({
      '_id': req.params.series
    },
    function (err, series) {
      if (err) {
        return next(err);
      }
      getPosts(req.params.site)
        .then(result => {
          console.log(result.length);
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
            createPost(x, series);
          });

          res.json(pagesArray);
        })
        .catch(next);
    });
});

var createPost = function (data, series) {
  let insert = createPageTemplate(data, series);
  insert.meta.blog = {
    pinned: 0,
    published_date: new Date(data.date).getTime() / 1000,
    author: 'demo'
  };
  Page.create(insert);
}

var createPage = function (data, series, parent) {
  let insert = createPageTemplate(data, series);
  insert.meta.order = 0;
  insert.meta.blog = false;
}

var createPageTemplate = function (data, series) {
  let template = {
    content: data.content,
    series: series.id,
    meta: {
      title: data.title,
      nav_title: null,
      status: data.status == 'publish' ? 9 : 5,
      created: Math.floor(new Date() / 1000),
      path: data.slug,
      updated: null,
      deleted: false,
    }
  };
  return template;
}

var getPosts = function (site) {
  let promise = new Promise((resolve, reject) => {
    let blog = wpcom.site(site);
    let result = [];
    blog.postsList({
        type: 'any',
        number: 100,
        fields: "ID,title,date,content,slug,type,status,parent,menu_order"
      })
      .then(result => {
        if (result.found > 100) {
          let promises = [];
          let posts = result.posts;
          for (let i = 2; i <= Math.ceil(result.found / 100); i++) {
            promises.push(blog.postsList({
              page: i,
              type: 'any',
              number: 100,
              fields: "ID,title,date,content,slug,type,status,parent,menu_order"
            }));
          }
          console.log(promises.length);
          Promise.all(promises)
            .then(results => {
              results.forEach(x => posts = posts.concat(x.posts));
              resolve(posts);
            })
            .catch(error => reject(error));
        } else {
          resolve(result.posts);
        }
      })
      .catch(error => reject(error));
  });
  return promise;
}

module.exports = router;