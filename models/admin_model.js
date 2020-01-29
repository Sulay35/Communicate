const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var adminSchema = new Schema({
    adminName:String,
    adminPwd:String,
    creation:Date,
})

module.exports = mongoose.model('Admin', adminSchema);