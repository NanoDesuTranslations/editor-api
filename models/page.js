var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseHidden = require('mongoose-hidden')();

var pageSchema = new Schema({
    meta: {type:Object}
  , series: {type: String, index:true}
  , content: {type: String, default:null}
  , uuid: {type: String}
  //, released: Date
}, {toJSON:{virtuals:true}, toObject:{virtuals:true}});

pageSchema.plugin(mongooseHidden, { defaultHidden: { _id:true, __v:true } });

module.exports = mongoose.model('Page', pageSchema);
