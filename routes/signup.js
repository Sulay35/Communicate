// Modules :
const express = require('express');
const router = express.Router();
const colors = require('colors');
const nodemailer = require('nodemailer');

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\
// EMAIL :
var transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user : 'example@gmail.com',
        pass : 'azerty'
    }
})

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\
// Mongoose sgbd
var mongoose = require('mongoose');

var options = {
    keepAlive:300000, 
    connectTimeoutMS:30000,
    useNewUrlParser : true,
    useUnifiedTopology:true,
    useFindAndModify:false,// for the findOneAndUpdate method
};

// URL de la base : main 
var urlmongo = "mongodb+srv://sulay:12345@cluster0-poyqm.mongodb.net/main?retryWrites=true&w=majority"
// connexion de l'API à la DB
mongoose.connect(urlmongo, options);

//Base de données
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur lors de la connexion à la DB'));
db.once('open', function(){
    console.log("connection à la DB main depuis" + " signup.js".grey + " OK".green)
});

// User model :
var Users = require('../models/user_model')

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\


// route
router.get('/signup', function(req, res){
    res.render('sign_up.ejs',{error:""})    
})
// POST REQUEST :
router.post('/signingup', function(req, res){
    // Inputs
    var name = req.body.username;
    var pass = req.body.password;
    var mail = req.body.email;

    // Inputs verifications :
    function inputVerification(){
        if(name.length > 3 && pass.length > 6 && mail.length > 5) return true; 
        else return false;
    }

    // if all the inputs are correctly filled
    if(inputVerification()){

        //Timer starts:
        console.time("creation time");
        
        // Verification:
        Users.countDocuments({"username":name}, function(err, count){
            if(count > 0){ // If this username already exists
                res.render('sign_up.ejs', {error:"L\'identifiant existe déja"}) // return to the sign in page with an error 
            }else{ // If this username is not taken
                var user = new Users({email:mail, username:name, password:pass, creation:Date()});
                user.save(function(err, user){ // save the new user to the database
                    //console.log('NEW USER ! : '.yellow + colors.yellow(user)); // Verbose version
                    console.log('NEW USER ! : '.yellow + "\n" + "username : " + colors.yellow(user.username) + "\n" + "password : " + colors.yellow(user.password));
                    if (err) return console.error(err);
                })
                
                
                const mailOptions = {
                    from:"The Communicate team <service.nodetest@gmail.com>",
                    to:mail,
                    subject:`Account created - Communicate`,
                    html:`<h2>Hello ${name}</h2></br> <p>Your account is created :</br><strong>Username : ${name}</strong> </br><strong>password : ${pass}</strong></br> </p>`,
                };
                transporter.sendMail(mailOptions, (err, info) => {
                    if(err){
                        console.error(err);
                    }else{
                        //console.log(info); //Mails informations  
                        // Saving mail data to the "emails" array:                      
                        Users.findOneAndUpdate(
                            { _id: user.id }, 
                            { $push: { emails: info} },
                            function (error, success) {
                                 if (error)console.errors(error);
                             });
                    }
                })
                
                // Timer ends :
                console.timeEnd("creation time");
                
                // name cookie
                res.cookie('connected', true, {maxAge:60*60*1000});
                res.cookie('username', name);
                res.redirect('/chat');
            }
        })
    }else{
        res.render('sign_up.ejs', {error:"Remplir vos entrées correctement"})
    }
        
})
    
// EXPORT:
module.exports = router;
