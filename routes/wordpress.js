var express = require('express')
var Router = express.Router;

var Series = require('../models/series.js');
var Page = require('../models/page.js');
var wpcom = require('wpcom')();
router = Router();

router.get('/:series/:site', function (req, res, next) {
  Series.findOne({
      '_id': req.params.series
    },
    function (err, series) {
      if (err) {
        return next(err);
      }
      getPosts(req.params.site)
        .then(result => {
          let pages = new Map();
          let posts = result.filter(x => x.type == 'post');
          let pagesArray = result.filter(x => x.type == 'page');

          // create map of pages with ID for key
          pagesArray.forEach(function (element) {
            element.children = [];
            pages.set(element.ID, element);
          }, this);

          // connect pages to their parents
          for (var [k, v] of pages) {
            if (v.parent) {
              pages.get(v.parent.ID).children.push(v);
            }
          }

          // create blog posts
          posts.forEach(x => {
            createPost(x, series);
          });

          // find first level pages
          let parentPages = Array.from(pages.values()).filter(x => !x.parent);
          // create pages starting with first level pages
          createPages(parentPages, series);

          // TODO: what to return?
          res.json(null);
        })
        .catch(next);
    });
});

// create blog post
var createPost = function (data, series) {
  let insert = createPageTemplate(data, series);
  insert.meta.blog = {
    pinned: 0,
    published_date: new Date(data.date).getTime() / 1000,
    author: 'demo' // TODO: get current user
  };
  Page.create(insert); // TODO: add some sort of error handling/progress watching?
}

// create pages
var createPages = function (pages, series, parent) {
  let hierarchy = series.config.hierarchy;
  // sort current pages to get correct insert order
  pages = pages.sort((a, b) => {
    if(a.menu_order != b.menu_order) {
      return a.menu_order - b.menu_order;
    }else {
      return a.title.localeCompare(b.title);
    }
  });

  for (let i = 0; i < pages.length; i++) {
    var insert = createPageTemplate(pages[i], series);
    insert.meta.blog = false;
    
    // first level pages wil have only one level of hierarchy
    if (parent == null) {
      insert.meta[hierarchy[0]] = i + 1;
    } else {
      // assign hierarchy to lower level pages
      for (var j = 0; j < hierarchy.length; j++) {
        var hierarchyLevel = hierarchy[j];
        // copy existing hierarchy from parent
        if (parent.meta[hierarchyLevel] != null) {
          insert.meta[hierarchyLevel] = parent.meta[hierarchyLevel];
        // add missing hierarchy level
        } else {
          insert.meta[hierarchyLevel] = i + 1;
          break;
        }
      }
    }
    Page.create(insert); // TODO: add some sort of error handling/progress watching?

    // create current page children of there are any
    if (pages[i].children.length > 0) {
      createPages(pages[i].children, series, insert);
    }
  }
}

// prepare default data for inserting
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

// gets posts from worpress
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
        // can only get 100 posts with one request so if there are more posts need to do additional requests
        if (result.found > 100) {
          let promises = [];
          let posts = result.posts;
          
          // prepare requests for getting leftover posts
          for (let i = 2; i <= Math.ceil(result.found / 100); i++) {
            promises.push(blog.postsList({
              page: i,
              type: 'any',
              number: 100,
              fields: "ID,title,date,content,slug,type,status,parent,menu_order"
            }));
          }
          
          //execute requests
          Promise.all(promises)
            .then(results => {
              // put posts together and return
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