var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');
var bcrypt = require('bcrypt-nodejs');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.sql.host,
    user: config.sql.user,
    password: config.sql.password,
    database: config.sql.database
});

connection.connect();

const apiBaseUrl = 'http://api.themoviedb.org/3';
const nowPlayingUrl = apiBaseUrl + '/movie/now_playing?api_key='+config.apiKey
const imageBaseUrl = 'http://image.tmdb.org/t/p/w300';

/* GET home page. */
router.get('/', function(req, res, next) {
    request.get(nowPlayingUrl,(error,response,movieData)=>{
        var movieData = JSON.parse(movieData);
        res.render('index', { 
            movieData: movieData.results,
            imageBaseUrl: imageBaseUrl,
            message: "Welcome to my movie app. These are now playing.",
            sessionInfo: req.session
         });
    })
});

router.post('/search', (req, res)=>{
    var termUserSearchedFor = req.body.searchString;
    var searchUrl = apiBaseUrl + '/search/movie?query='+termUserSearchedFor+'&api_key='+config.apiKey;
    request.get(searchUrl,(error,response,movieData)=>{
        var movieData = (JSON.parse(movieData));
        res.render('index', {
            movieData: movieData.results,
            imageBaseUrl: imageBaseUrl,
            message: "Results for "+ termUserSearchedFor +":"
        });
    });
});

router.get('/movie/:id', (req, res)=>{
    var thisMovieId = req.params.id
    var thisMovieUrl = apiBaseUrl + '/movie/'+thisMovieId+'?api_key='+config.apiKey;
    request.get(thisMovieUrl, (error,response,movieData)=>{
        var movieData = JSON.parse(movieData);
        res.render('single-movie', {
            movieData: movieData,
            imageBaseUrl: imageBaseUrl
        });
    });
});

router.get('/register', (req,res)=>{
    // res.send("This is the register page")
    var message = req.query.msg;
    if(message == "badEmail"){
        message = "This email is already registered!";
    }
    res.render('register', {message})
});

router.post('/registerProcess', (req,res)=>{
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var hash = bcrypt.hashSync(password);

    var selectQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(selectQuery,[email],(error,results)=>{
        if (results.length == 0){
            var insertQuery = "INSERT INTO users (name,email,password) VALUES (?,?,?)";
            connection.query(insertQuery, [name,email,hash], (error,results)=>{
                req.session.name = name;
                req.session.email = email;
                req.session.loggedin = true;
                res.redirect('/?msg=registered')
            });
        }else{
            res.redirect('/register/?msg=badEmail');
        }
    })
    // res.json(req.body);
});

router.get('/login', (req,res)=>{
    // res.send("This is the register page")
    res.render('login', {})  
});

router.post('/processLogin',(req,res)=>{
    // res.json(req.body);
    var email = req.body.email;
    var password = req.body.password;
    // var selectQuery = "SELECT * FROM users WHERE email = ? AND password = ?";
    var selectQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(selectQuery, [email], (error,results)=>{
        if(results.length == 1){
            var match = bcrypt.compareSync(password,results[0].password);
            if(match == true){
                req.session.loggedin = true;
                req.session.name = results.name;
                req.session.email = results.email;
                res.redirect('/?msg=loggedIn');
            }else{
                res.redirect('/login?msg=badLogin');    
            }
        }else{
            res.redirect('/login?msg=badLogin');
        }
    })
})

module.exports = router;
