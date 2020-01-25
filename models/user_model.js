var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    email:String,
    username:String,
    password:String,
    creation:String,
    emails:Array,
})

module.exports = mongoose.model('Users', usersSchema);