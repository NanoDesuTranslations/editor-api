var mongoose = require('mongoose')
var Schema = mongoose.Schema
var mongooseHidden = require('mongoose-hidden')();

var seriesSchema = new Schema({
    config: {type:Object}
  , name: {type: String}
  , uuid: {type: String}
  //, released: Date
}, {toJSON:{virtuals:true}, toObject:{virtuals:true}})

seriesSchema.plugin(mongooseHidden, { defaultHidden: { _id:true, __v:true } });

module.exports = mongoose.model('Series', seriesSchema)
