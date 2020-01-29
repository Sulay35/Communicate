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
app.use(express.static('public'))



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
});

// Admin
const administrator = require('./routes/admin');
app.use(administrator);

// connection :
const connection = require('./routes/connection');
app.use(connection);

// Account creation
const signup = require('./routes/signup');
app.use(signup);

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
app.get('/disconnect', disconnection);



// Page not found
app.use(function(req, res, next){
    res.status(404).send('Erreur 404 - Page Introuvable !<a href="/">Revenir à l\'acceuil </a>');
})

app.listen(8080, () => {
    console.log('Server listening on port %s'.magenta,3000);
});