var express = require('express');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var colors = require('colors')

//Setup
var app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.set('view engine', 'ejs');
app.use(cookieSession({
    name:'session', 
    keys: ['key1', 'key2'],
    maxAge: 10000 // 24h
}));
app.use(cookieParser())

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

// Schéma de l'user:
var usersSchema = mongoose.Schema({
    email:String,
    username:String,
    password:String,
    creation:String,
})
//Model :
var Users = mongoose.model('Users', usersSchema);

//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\
//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\
//▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\\

// Main page
app.get('/', function(req, res){
    if(req.cookies.connected == 'true'){
        res.redirect('/chat');
    }else{
        res.redirect('/connection');
    }
})

// Connection
app.get('/connection', function(req, res){
    res.render('connection_page.ejs', {error:""})
})
app.post('/connect', function(req, res){
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

// Account creation
app.get('/signup', function(req, res){
    res.render('sign_up.ejs',{error:""})    
})
app.post('/signingup', function(req, res){
    // Inputs
    var name = req.body.username;
    var pass = req.body.password;
    var mail = req.body.email;

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
            // name cookie
            res.cookie('connected', true, {maxAge:60*60*1000});
            res.cookie('username', name);
            res.redirect('/chat');
        }
    })
    
})

//Chat
app.get('/chat', function(req, res){
    if(req.cookies.connected == 'true'){
        res.render('chat.ejs', {name:req.cookies.username});
    }else{ // If the user isn't connected then he's redirected to the connection page
        res.redirect('/connection');
    }
})

// Disconnection
var disconnection = (req, res) =>{
    res.cookie('connected', false);
    res.clearCookie('username');
    res.redirect('/')
}

app.get('/disconnect', disconnection)



// Page not found
app.use(function(req, res, next){
    res.status(404).send('Erreur 404 - Page Introuvable !<a href="/">Revenir à l\'acceuil </a>');
})

app.listen(3000);