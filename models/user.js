var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseHidden = require('mongoose-hidden')();

var userSchema = new Schema({
    username: {type: String, index:true, unique:true},
    password_hash: {type: String},
    perms: {
        view:[{type: Number}],
        edit:[{type: Number}],
        admin:{type: Boolean}
    }
}, {toJSON:{virtuals:true}, toObject:{virtuals:true}});

userSchema.plugin(mongooseHidden, { defaultHidden: { _id:true, __v:true } });

module.exports = mongoose.model('User', userSchema);
