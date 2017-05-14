var express = require('express');
var router = express.Router();
var multer = require('multer');

function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()){   // makes use of Passport's isAuthenticated method
    //console.log("you are authenticated");
    return next();
  }

  else{
    //console.log("you are not authenticated");
    res.redirect('/') // redirect them to root login page?
  }
}



/* GET home page. */
router.get('/', function(req, res, next) {
  var db = req.db;
  res.render('index', { title: 'Express' });
});


//Added by Joey
// ensureAuthenticated was removed from parameters from get rides and get myRides
// to allow for ease of work on project
router.get('/rides',ensureAuthenticated, function(req, res) {
    var db = req.db;

    db.find({},{},function(e,docs){
        res.render('rides', {
            "rides" : docs
        });
    });
});
//
router.get('/myRides', ensureAuthenticated, function(req, res) {
    var db = req.db;

    db.find({},{},function(e,docs){
        res.render('myRides', {
            "myRides" : docs
        });
    });
});

router.get('/pastRides', ensureAuthenticated, function(req, res) {
    var db = req.db;

    db.find({},{},function(e,docs){
        res.render('pastRides', {
            "pastRides" : docs
        });
    });
});

router.get('/profile', ensureAuthenticated, function(req, res) {
    var db = req.db;
    var db_api = req.db_api;


    //console.log();
    db_api.findProfile(req.user.email).then(function(user){

        res.render('profile',{"user":user});
    });
});

router.get('/enteremail', function(req, res) {
    res.render('enterEmail');
});


module.exports = router;
