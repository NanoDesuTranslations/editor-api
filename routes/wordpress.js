var express = require('express')
var Router = express.Router;

var wpcom = require( 'wpcom' )();
router = Router();

router.get('/:site', function(req, res, next) {
  console.log('Starting to get posts');
  getPosts(req.params.site)
    .then(x => {
      let result = {};
      console.log(x);
      x.forEach(function(element) {
        element.children = [];
        result[element.ID] = element;
      }, this);
      res.json(result);
    });
});

var getPosts = function(site) {
  let promise = new Promise((resolve, reject) => {
    let blog = wpcom.site( site );
    let result = [];
    blog.postsList({type:'any', number:100, field:"ID,title,date,content,slug,type,parent,menu_order"})
    .then(result => {
      console.log('Got posts');
      resolve(result.posts);
    })
    .catch(error => reject(error));
  });
  return promise;
}

module.exports = router;
