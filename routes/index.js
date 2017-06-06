var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('../config/config');

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
            message: "Welcome to my movie app. These are now playing."
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

module.exports = router;
