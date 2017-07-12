var express = require('express')
var Router = express.Router;

var wpcom = require( 'wpcom' )();
router = Router();

router.get('/:site', function(req, res, next) {
  console.log('Starting to get posts');
  getPosts(req.params.site)
    .then(result => {
      let pages = new Map();
      let posts = result.filter(x => x.type == 'post');
      let pagesArray = result.filter(x => x.type == 'page');
      
      pagesArray.forEach(function(element) {
        element.children = [];
        pages.set(element.ID, element);
      }, this);
      
      for(var [k, v] of pages) {
        if(v.parent) {
          pages.get(v.parent.ID).children.push(v);
        }
      }
      
      res.json(pagesArray);
    })
    .catch(next);
});

var getPosts = function(site) {
  let promise = new Promise((resolve, reject) => {
    let blog = wpcom.site( site );
    let result = [];
    blog.postsList({type:'any', number:100, fields: "ID,title,date,content,slug,type,parent,menu_order"})
    .then(result => {
      // TODO: handle blogs with postcount over 100
      resolve(result.posts);
    })
    .catch(error => reject(error));
  });
  return promise;
}

module.exports = router;
