const express = require('express');
const router = express.Router();
const colors = require('colors');

// ◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘\\
// Mongoose sgbd
var mongoose = require('mongoose');
var options = {server: {socketOptions: {keepAlive:300000, connectTimeoutMS:30000}}, replset:{socketOptions: {keepAlive: 300000, connectTimeoutMS: 30000}}};
// URL de la base
var urlmongo = "mongodb+srv://sulay:12345@cluster0-poyqm.mongodb.net/test?retryWrites=true&w=majority"
// connexion de l'API à la DB
mongoose.connect(urlmongo, options);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur lors de la connexion à la DB'));
db.once('open', function(){
    console.log("connexion à la MDB OK ".green)
})


// ◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘◘\\
// User model :
var Users = require('../models/user_model')

router.get('/signup', function(req, res){
    res.render('sign_up.ejs',{error:""})    
})
router.post('/signingup', function(req, res){
    // Inputs
    var name = req.body.username;
    var pass = req.body.password;
    var mail = req.body.email;

    //Timer starts:
    console.time()

    // Verification
    Users.countDocuments({"username":name}, function(err, count){
        if(count > 0){ // If this username already exists
            res.render('sign_up.ejs', {error:"L\'identifiant existe déja"}) // return to the sign in page with an error 
        }else{ // If this username is not taken
            var user = new Users({email:mail, username:name, password:pass, creation:Date()});
            user.save(function(err, user){ // save the new user to the database
                console.log('NEW USER ! : '.yellow + colors.yellow(user));
                if (err) return console.error(err);
            })
            
            // Timer ends :
            console.timeEnd()
            
            // name cookie
            res.cookie('connected', true, {maxAge:60*60*1000});
            res.cookie('username', name);
            res.redirect('/chat');
        }
    })
    
})

// EXPORT:
module.exports = router;