const express = require('express');
const Admins = require('../models/admin_model');
const router = express.Router();

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\
// MongoDB

const mongoose = require('mongoose');
var options = {
    keepAlive:300000, 
    connectTimeoutMS:30000,
    useNewUrlParser : true,
    useUnifiedTopology:true,
};

// URL de la base : main
var urlmongo = "mongodb+srv://sulay:12345@cluster0-poyqm.mongodb.net/main?retryWrites=true&w=majority"
mongoose.connect(urlmongo, options);

// Base de données : main 
var db = mongoose.connection;
db.on('error', console.error.bind(console, "Erreur lors de la connection à la DB main"));
db.once('open', function(){
    console.log("connection à la DB main depuis" + " admin.js".grey + " OK".green)
});


//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\


router.get('/admin', (req, res) =>{
    res.render('administrator.ejs')
});

router.post('/adminconnect', (req, res) => {
    let adminUser = req.body.username;
    let adminPass = req.body.password;
    Admins.countDocuments({"adminName":adminUser}, (err, count) => {
        if(err) console.error.bind(err);
        if(count > 0){
            Admins.find({adminName:adminUser}, (err, administrator) => {
                if(err) console.error(err);
                else{
                    if(administrator[0].adminPwd== req.body.password){
                        console.log('OK')
                        res.redirect('/signup')
                    }else{
                        res.redirect('/admin')
                    }
                }
            })
        }
    })
})

module.exports = router;