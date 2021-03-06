var path = require('path');

var express = require('express');
var Router = express.Router;
var logger = require('morgan');
var bodyParser = require('body-parser');

var config = require('config');

if(config.get("uri").indexOf("tingodb://") != -1){
  var tungus = require('tungus');
  console.log("Tungus Activated.");
}
var mongoose = require('mongoose');
var mongooseHidden = require('mongoose-hidden')();

mongoose.connect(config.get("uri"), function (err) {
  if(err) {
    console.log('connection error', err);
  } else {
    console.log('connection successful');
  }
});

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, config.get('public-path'))));

var router = require('./routes/user.js');
app.use("/user", router);

var static_path = config.get('static-path');
if(static_path){
  router = express.static(static_path);
  app.use('/test', router);
  app.use('/test', function(req, res){
    res.status(404);
    res.end("Page not found.")
  });
}

img_router = require('./routes/img_serve.js');
app.use("/img/auth_ui", img_router.auth_ui)

single_page = require('./routes/single_page.js')
app.use("/p", single_page.router)

var auth = require('./auth.js');
app.use(auth.middleware);

router = require('./routes/pages.js');
app.use("/pages", router);

router = require('./routes/series.js');
app.use("/series", router);

router = require('./routes/build.js');
app.use("/build", router);

router = require('./routes/admin.js');
app.use("/admin", router)


app.use("/img", img_router.router);

module.exports = app;

app.set('port', config.get('port'));
var bind_address = config.get('address') || undefined;

var server = app.listen(app.get('port'), bind_address, function() {
  console.log('Express server listening on port ' + server.address().port);
});
