var path = require('path')

var express = require('express')
var Router = express.Router;
var logger = require('morgan');
var bodyParser = require('body-parser');

/*var Db = require('tingodb')().Db,
    assert = require('assert');

var db = new Db('./db/test', {});*/

var tungus = require('tungus')
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var mongooseHidden = require('mongoose-hidden')();

mongoose.connect('tingodb://./db/test', function (err) {
  if(err) {
    console.log('connection error', err);
  } else {
    console.log('connection successful');
  }
})

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var auth = require('./auth.js')
app.use(auth.middleware)

var router = require('./routes/pages.js')
app.use("/pages", router)

router = require('./routes/series.js')
app.use("/series", router)

module.exports = app;

//var debug = require('debug')('todoApp');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
  //debug('Express server listening on port ' + server.address().port);
});
