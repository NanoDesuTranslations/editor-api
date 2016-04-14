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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var auth = require('./auth.js');
app.use(auth.middleware);

var router = require('./routes/pages.js');
app.use("/pages", router);

router = require('./routes/series.js');
app.use("/series", router);

router = require('./routes/build.js');
app.use("/build", router);

module.exports = app;

app.set('port', config.get('port'));

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
