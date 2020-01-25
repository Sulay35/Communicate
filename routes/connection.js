const express = require('express');
const router = express.Router();

// Mongoose sgbd
var mongoose = require('mongoose');
// var options = {server: {socketOptions: {keepAlive:300000, connectTimeoutMS:30000}}, replset:{socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}};
var options = {
    keepAlive:300000, 
    connectTimeoutMS:30000,
    useNewUrlParser : true,
    useUnifiedTopology:true,

};

// URL de la base
var urlmongo = "mongodb+srv://sulay:12345@cluster0-poyqm.mongodb.net/test?retryWrites=true&w=majority"
// connexion de l'API à la DB
mongoose.connect(urlmongo, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur lors de la connexion à la DB'));
db.once('open', function(){
    console.log("connexion à la MDB OK ".green)
})

// User model :
var Users = require('../models/user_model');




// Connection
router.get('/connection', function(req, res){
    res.render('connection_page.ejs', {error:""})
})
router.post('/connect', function(req, res){
    var name = req.body.username;
    Users.countDocuments({username:name}, function(err, count){
        if(err) console.error.bind(err);
        if(count > 0){//user exists
            Users.find({username:name}, function(err, user){
                if(err){
                    console.error(err);
                }
                else{
                    if(user[0].password == req.body.password){
                        res.cookie('connected', true, {maxAge:60*60*1000});
                        res.cookie('username', name);
                        res.redirect('/chat');
                    }else{
                        res.render('connection_page.ejs', {error:"Mot de passe incorrect"})
                    }
                }
            })
        }else{ //user does not exists
            res.render('connection_page.ejs', {error:"Identifiant inexistant"})
        }
    })
})

module.exports = router;