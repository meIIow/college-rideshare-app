module.exports = function(testing){

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongo = require('mongodb');
var multer = require("multer");


// for the email VAR
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var routes = require('./routes/index');
var app = express();



//******************************************************************************
//OUR LIBRARIES
var monk = require('monk');
//Testing is the flag for running tests, never runs from npm start
//Chooses test db folder when running
var db = monk('localhost:27017/userData');

if (!testing){
  var database = db.get("usercollection");
}
else{
  var database = db.get("testcollection");
  //Setup to grab the right collection to
}
  var bcrypt = require('bcryptjs');


var db_api = require('./lib/db_api')(mongo, database,bcrypt);

// PASSPORT MIDDLEWARE
var passport = require('passport');  // npm install passport, npm install passport-local --> NEED BOTH
var LocalStrategy = require('passport-local').Strategy;


// additional setup for passport, including SESSIONS - Andrew
// this would also require: npm install express-session
var session = require("express-session");
app.use(session({secret:'what is a secret?'}));
app.use(passport.initialize());
app.use(passport.session());


//var bcrypt = require('bcrypt');

//USED FOR TESTS, DONT REMOVE
var test_functions = require('./lib/testFunctions.js')(database,bcrypt);
//jjd added
//var trip = require('./lib/postATrip.js')(db);

//******************************************************************************

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/tripTests', function(req, res){
  ////console.log("0");
  user = req.body.user;
  ////console.log("1");
  db_api.makeTrip(user);

});


app.post('/postRideSingle', function(req, res){
  /*
  This will hold all the post requests for a singular ride, in the body of the
  post should be a JSON object that contains all the necessary information
  for a ride (Source, Destination, Driver, etc...)
  */
  ////console.log("post-post");
  driver = req.user.email;
  src = req.body.src;
  dst = req.body.dst;
  depTime = req.body.depTime;
  arrTime = req.body.arrTime;
  numSeats = req.body.numSeats;
  askPrice = req.body.askPrice;
  db_api.makeTrip(driver, false).then(function(){
    ////console.log("inthen");
    db_api.makeDriverRide(driver, src, dst, depTime, arrTime, numSeats, askPrice).then(function(result){
        res.send(result);
    });
  });

});

app.post('/rate_the_rider', function(req, res){

  //tripId = req.body.trip

  //rider, punctuality, experience

  rider = req.body.email;
  punctuality = req.body.punctuality;
  experience = req.body.experience;



  db_api.rateRider(rider, punctuality, experience);
});


app.post('/rate_the_driver', function(req, res){

  //tripId = req.body.trip

  //rider, punctuality, experience

  rider = req.body.email;
  punctuality = req.body.punctuality;
  cleanliness = req.body.experience;



  db_api.rateDriver(rider, punctuality, experience);
});



app.post('/driverRideTests', function(req, res){

  //tripId = req.body.trip
  driver = req.user.email;
  src = req.body.src;
  dst = req.body.dst;
  depTime = req.body.depTime;
  arrTime = req.body.arrTime;
  numSeats = req.body.numSeats;
  db_api.makeDriverRide(driver, src, dst, depTime, arrTime, numSeats);
});

app.post('/postRideDouble', function(req, res){
    /*
    This will hold all the post requests a ride and return trip, in the body of the
    post should be a JSON object that contains all the necessary information
    for a ride (Source, Destination, Driver, etc...)
    */
  driver = req.user.email;
  src = req.body.src;
  dst = req.body.dst;
  depTime = req.body.depTime;
  arrTime = req.body.arrTime;
  numSeats = req.body.numSeats;
  depTimeReturn = req.body.depTimeReturn;
  arrTimeReturn = req.body.arrTimeReturn;
  numSeatsReturn = req.body.numSeatsReturn;
  askPrice = req.body.askPrice;
  askReturn = req.body.askReturn;
  db_api.makeTrip(driver, true).then(function(){
    db_api.makeDriverRide(driver, src, dst, depTime, arrTime, numSeats, askPrice).then(function(first){
      db_api.makeDriverRide(driver, dst, src, depTimeReturn, arrTimeReturn, numSeatsReturn, askReturn).then(function(second){
        res.send([first,second]);
      });
    });
  });

});

//Added By Joey
app.use(function(req,res,next){
    req.db = database;
    req.db_api = db_api;
    next();
});

var transporter = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "nuberctesting@gmail.com",
        pass: "NUbeRC2015"
    }
});

/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

var send_ver_email = function(object,req){
  /*
  This will simply, send an email to the new user -- IN ORDER TO SIGN IN, A
  USER MUST BE VERIFIED

  The only way to do so will be to access the link that follows their username

    NOTE:
      for securities sake, we may want to modify the Addr accessed to be hashed
      before sending to user, ie, how do we verify that they exist in DB without
      giving them the object ID from Mongo?
  */

    var rand,mailOptions,host,link;
    rand= object._id;
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;

    ////console.log(object);


    mailOptions={
        to : object.email,
        subject : "Carpanion Email Confirmation",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
    }
    ////console.log(mailOptions);
    transporter.sendMail(mailOptions, function(error, response){
     if(error){
            ////console.log(error);
    //  res.end("error");
     }else{
           ////console.log("Message sent: " + response.message);
    //    res.end("sent");
         }
});
};


var forgot_password_email = function(object,req){
  /*
    sends forgot password email to user (passed in via 'object').
    Is called by the /forgot_password_email POST request
  */

  var rand,mailOptions,host,link;
  rand= object._id;
  host=req.get('host');
  link="http://"+req.get('host')+"/forgotPassword?id="+rand;

  mailOptions={
      to : object.email,
      subject : "Carpanion Forgot Password",
      html : "Hello,<br> Please Click on the link to reset your password.<br><a href="+link+">Click here to change your password</a>"
  }
  ////console.log(mailOptions);
  transporter.sendMail(mailOptions, function(error, response){
   if(error){
          ////console.log(error);
  //  res.end("error");
   }else{
         console.log("Message sent: " + response.message);
  //    res.end("sent");
       }
  });


};


var email_bid_to_driver  = function(rideID,req){
    console.log("Inside email the driver ");
    console.log(rideID);
    // getting the driver object.
    var driver_email, driver_destination, driver_src;

    db_api.find_match({type: 'ride', _id: rideID}).then(function(result){
      console.log("Inside THEN for email driver ");
      console.log(result);
      driver_email = result[0].driver;
      driver_destination = result[0].destination;
      driver_src = result[0].source;

      console.log("driver source: "+driver_src);


    var rand,mailOptions,host,link;
    //rand= object._id;
    host=req.get('host');
    link="http://"+req.get('host');

    console.log("This should be Rob's email:" + driver_email);


    mailOptions={
        to : driver_email,
        subject : "Someone has Bid on your ride!",
        html : "Hello,<br> Someone has bid on your ride from "+driver_destination+" to "+driver_src+"! .<br><a href="+link+">Sign into Carpanion to see ride details!</a>"
    }
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
    //  res.end("error");
     }else{
           console.log("Message sent: " + response.message);
    //    res.end("sent");
         }

  });
});
};



var email_acptRide_to_ride  = function(rider_email,rideID, req){
    console.log("Inside email the rider ");
    console.log("email_acptRide_to_ride email:"+rider_email);
    // getting the driver object.
    //var driver_email, driver_destination, driver_src;

    db_api.find_match({type: 'ride', _id: rideID}).then(function(result){
      console.log("Inside THEN for email driver ");
      console.log(result);
      driver_email = result[0].driver;
      driver_destination = result[0].destination;
      driver_src = result[0].source;

      console.log("driver source: "+driver_src);


    var rand,mailOptions,host,link;
    //rand= object._id;
    host=req.get('host');
    link="http://"+req.get('host');

    //console.log("This should be Rob's email:" + driver_email);


    mailOptions={
        to : rider_email,
        subject : "Someone has Accepted on your Bid!",
        html : "Hello,<br> Your bid has been Accepted from "+driver_destination+" to "+driver_src+"! .<br><a href="+link+">Sign into Carpanion to see ride details!</a>"
    }
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
    //  res.end("error");
     }else{
           console.log("Message sent: " + response.message);
    //    res.end("sent");
         }

  });
});
};


//---
var cancel_ride_email_to_driver  = function(req){
    var rider_email = req.body.rider_email;
    var rideID = req.body.ride_ID;
    var rider_userName = req.body.user;



    console.log("rider username:"+rider_userName);
    //console.log(rideID);
    // getting the driver object.
    var driver_email, driver_destination, driver_src;

    db_api.find_match({type: 'ride', _id: rideID}).then(function(result){
      console.log("Inside THEN for email driver ");
      console.log(result);
      driver_email = result[0].driver;
      driver_destination = result[0].destination;
      driver_src = result[0].source;

      console.log("driver source: "+driver_src);


    var rand,mailOptions,host,link;
    //rand= object._id;
    host=req.get('host');
    link="http://"+req.get('host');

    console.log("This should be  email:" + driver_email);


    mailOptions={
        to : driver_email,
        subject : "Someone has cancelled on your drive!",
        html : "Hello,<br> "+rider_userName+" has cancelled on your ride from "+driver_destination+" to "+driver_src+"! .<br><a href="+link+">Sign into Carpanion to see ride details!</a>"
    }
    console.log(mailOptions);
    transporter.sendMail(mailOptions, function(error, response){
     if(error){
            console.log(error);
    //  res.end("error");
     }else{
           console.log("Message sent: " + response.message);
    //    res.end("sent");
         }

  });
});
};
//--
var cancel_ride_email_to_riders  = function(req){
    //var rider_email = req.body.driver;
    var rideID = req.body.ride_ID;
    var rider_userName = req.body.user;



    console.log("rider username:"+rider_userName);
    //console.log(rideID);
    // getting the driver object.
    var driver_email, driver_destination, driver_src;

    db_api.find_match({type: 'ride', _id: rideID}).then(function(result){
      //console.log("Inside THEN for email driver ");
      console.log(result);
      riders = result[0].riders;
      potential_riders = result[0].potential_riders;
      driver_email = result[0].driver;
      driver_destination = result[0].destination;
      driver_src = result[0].source;


      console.log("driver source: "+driver_src);


    var rand,mailOptions,host,link;
    //rand= object._id;
    host=req.get('host');
    link="http://"+req.get('host');

    console.log("This should be  email:" + driver_email);

    riders.forEach(function(rider_email){


        mailOptions={
            to : rider_email,
            subject : driver_email+" Has cancelled their drive",
            html : "Hello,<br> "+driver_email+" has cancelled on your ride from "+driver_destination+" to "+driver_src+"! .<br><a href="+link+">Sign into Carpanion to see ride details!</a>"
        }
        console.log(mailOptions);
        transporter.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
        //  res.end("error");
         }else{
               console.log("Message sent: " + response.message);
        //    res.end("sent");
             }

           });
    });

    potential_riders.forEach(function(rider_email){


        mailOptions={
            to : rider_email,
            subject : driver_email+" Has cancelled their drive",
            html : "Hello,<br> "+driver_email+" has cancelled on your ride from "+driver_destination+" to "+driver_src+"! .<br><a href="+link+">Sign into Carpanion to see ride details!</a>"
        }
        console.log(mailOptions);
        transporter.sendMail(mailOptions, function(error, response){
         if(error){
                console.log(error);
        //  res.end("error");
         }else{
               console.log("Message sent: " + response.message);
        //    res.end("sent");
             }

           });
    });
});
};















app.use(bodyParser.urlencoded({ extended: false }));

app.post("/create_account",function(req,res){
  /*
  This function is called when a user tries to create a new account

  Should add a user object to the DB and populate it with the default user
  parameters.
  */
  //////console.log(" inside create account on server");
  var user_name=req.body.user;
  var password=req.body.pass;
  var email= req.body.email;


  db_api.create_new_user(user_name,email,password).then(function(result){
    if (result[0] === 'u'){ // check first letter of message - username already taken
      //console.log('username taken');
      res.send(result);
    }
    else if(!result){ // db or other failure unrelated to account credentials
      //console.log("Some db or other failure");
      res.send(false);
    }else{  // success - send verification email
      //console.log(email+" sending success result");
      send_ver_email(result,req);
      res.send(result);
    }
  });
});


app.post("/forgot_password_email", function(req, res){
  /*
      Catches request to send email to user who has forgotten password. Calls the forgot_password_email function in app.js
      Sees if account exists before sending email
  */
  var email = req.body.email;
  console.log("app what is email? " + email);
  db_api.find_match({email: email}).then(function(result){
    var results = JSON.parse(JSON.stringify(result));

    // if user already has account and account is verified
    if (results.length === 1 && results[0].verified === true){
      forgot_password_email(results[0], req);
      res.send(true);
    }

    // otherwise don't send email
    else{
      //console.log("user doesn't have verified account");
      res.send(false);
    }


  });
});

app.post("/forgot_password_reset", function(req, res){
  /*
    Catches request to reset user's password.
  */

  // retrieve user id + new password
  var id = req.body.id;
  var newPassword = req.body.newPassword;

  // update user profile with db function
  db_api.forgot_password_reset(id, newPassword).then(function(result){
    res.send(result);
  })

});

app.post("/find_ride",function(req,res){
  /*
    Should be called when a user is attempting to find a ride and gives a couple
    necessary parameters --------- Destination and Date are the 2  we should
    optimize for and focus on
  */

  //////console.log(req.body);
  /*
  This function is called when a user tries to create a new account
  */

  var arriveTime=req.body.arrival;
  var dest=req.body.destination;
  var departTime = req.body.depart;
  var seats_avail = req.body.seats_avail;
  var start = req.body.from_here;

  var rideRequest = {
    arrival_time: arriveTime,
    destination: dest,
    departure_time: departTime,
    number_of_seats: seats_avail,
    source: start
  };



  db_api.find_ride(rideRequest).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });


}
);

app.post("/find_general",function(req,res){
  /*
    Should be used to find rides --
    NOTE:
      Why is this a duplicate?
  */

  var query =req.body;



  db_api.find_match(query).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });


}
);

app.post("/insert_general",function(req,res){
  /*
  NOTE:
    REMOVE THIS BEFORE SHIPPING
  */

  ////console.log(req.body);
  /*
  This function is called when a user tries to create a new account
  */

  var query =req.body;



  db_api.insert_object(query).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });


}
);

app.post("/accept_rider",function(req,res){
  /*
  Should be used to select what riders are going to with you --
  no cancel ability should be offered.
  */

  //////console.log(req.body);


  var rider_email = req.body.rider_email;
  var ride_ID = req.body.ride_ID;

  console.log("before email_acptRide_to_ride in accept_rider");
  email_acptRide_to_ride(rider_email, ride_ID, req);

  db_api.accept_rider(rider_email, ride_ID).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });


}
);

app.post("/bid_on_ride",function(req,res){
    /*
    Should be used when a user has bid on a ride,
    Associate the ride with the user object as a potential ride
    Associate the User with the ride as a potential rider
    Notify the Driver that the user would like to ride with them

    */
  //////console.log(req.body);



  var newTrip =req.body.new_trip;
  var tripNum=req.body.trip_num;
  var rider_email = req.user.email;
  var rideID = req.body.ride_ID;
  var tripName = req.body.tripName;

  email_bid_to_driver(rideID, req)


  console.log('triggering bid on ride');
  db_api.bid_on_ride(rider_email, rideID, tripNum, newTrip, tripName).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });


}
);

app.post("/cancel_ride",function(req,res){


  /*
  This function is called when a rider cancels
  */

  var rider_email = req.body.rider_email;
  var rideID = req.body.ride_ID;

  cancel_ride_email_to_driver(req);

  db_api.cancel_ride(rider_email, rideID).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });


}
);

app.post("/cancel_drive",function(req,res){

  ////console.log(req.body);
  /*
  This function allows the driver to cancel their own drive.
  */
  console.log("Entering cancel a drive")

  var driver_email = req.body.driver_email;
  var rideID = req.body.ride_ID;

  cancel_ride_email_to_riders(req);

  db_api.cancel_drive(driver_email, rideID).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });


}
);


app.post("/find_all_trips",function(req,res){

  ////console.log(req.body);
  /*
  This function is called to find all of a user's trips
  */

  var user_email = req.body.user_email;


  db_api.find_all_trips(user_email).then(function(result){
    ////console.log(result + "string");
    res.send(result);
  });
});


app.get('/userEmail', function(req, res){
  ////console.log("Inside APP get userEmail");
  ////console.log(req.user.email);

  res.send(req.user.email);

});

app.get('/user', function(req, res){
  ////console.log("Inside APP get user");
  ////console.log(req.user);

  res.send(req.user);

});

app.post('/getBidders', function(req, res){
  bidders = req.body.bidders;
  profs = []
  ////console.log('in getBidders')
  db_api.findMultiProfile(bidders).then(function(profs){
    ////console.log('completed multi find');
    ////console.log(profs);
    res.send(profs);
  });
});



// handles request to update profile username and phone number through db, returns whether it was successful or not (true/false)
app.post('/editProfile', function(req, res){
  email = req.user.email;
  username = req.body.username;
  phoneNumber = req.body.phoneNumber;

  ////console.log(email + " " + username + " " + phoneNumber);

  // make call to db
  db_api.edit_profile(email, username, phoneNumber).then(function(result){
    res.send(result);
  });
});

// handles request to update user's password, returns whether it was successful or not (true/false)
app.post('/changePassword', function(req, res){
  email = req.user.email;
  oldPassword = req.body.oldPassword;
  newPassword = req.body.newPassword;

  // update user profile in db
  db_api.change_password(email, oldPassword, newPassword).then(function(result){
    res.send(result);
  });

});

/*
--------------------------------------------
ADDITIONAL CODE FOR PASSPORT/LOGIN - should put into a separate module or something later?
--------------------------------------------
*/

// set up strategy for authentication (use Joey's db_api login function, but modified to fit Passport requirements)
passport.use(new LocalStrategy(
  {
    usernameField:'email',  // as our implementation uses 'email' field instead
  },
  function(username, password, done){
    db_api.login(username, password).then(function(user){
      // returns either done(null, false) if user not found, or done(null, user);
      if (user === false){
        return done(null, false);
      }
      else{
        return done(null, user);
      }
    });
  }
));

// provide serializeUser and deserializeUser functions to passport for session management (is called internally by passport.authenticate)
passport.serializeUser(function(user, done){

  done(null, user.email);

});

passport.deserializeUser(function(email, done){
  // provide actual user object from db for session
  db_api.findProfile(email).then(function(user){
    done(false, user);
  });

});


// catches request to login from the client side - returns either true/false whether login successful or not
app.post("/request_login", function(req, res, next){
  passport.authenticate('local', function(err, user){
    //console.log('in passport authenticate callback');
    if (err){
      // errors handled within our db_api login function
    }

    // unsuccessful login - user object from db was not passed to passport
    if (!user){
      res.send(false);
    }

    // user successfully authenticated - user object from db passed to passport, so log user in using passport's login()
    req.login(user, function(err){
      console.log('we get further in here?');
      res.send(true);
    });
  })(req, res, next);
});

// redirect user to home page after logout
app.get("/logout", function(req, res){

  req.logout();
  res.redirect('/');

});


//
if (!testing){
  app.use('/', routes);
}else{

  app.get("/",function(req,res){
    res.render('test', { title: 'testJade' });
  });
  app.get("/Qunit_tests.js",function(req,res){
    res.sendFile('lib/Qunit_tests.js', {root: __dirname });
  });
  app.get("/test_http_requests.js",function(req,res){
    res.sendFile('lib/test_http_requests.js', {root: __dirname });
  });
  app.get("/main.js",function(req,res){
    res.sendFile('public/javascripts/main.js', {root: __dirname });
  });

  app.get('/ERASE_DB', function(req, res){
      test_functions.db_delete().then(function(result){
        //////console.log(result);
        res.send(result);
      });
    });

}
//--------------------------------------------------------------
// ADDING EMAIL VERIFICATION CODE
//--------------------------------------------------------------

/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/


app.get('/verify',function(req,res){
  /*
  This verify should be called when someone attempts to verify their account
  THIS MEANS, the post request must contain a reference to the user object in
  some form. We must verify that this is true, and set the verified flag to true.

  --Should not be an in depth change to the account, should simply be a
   true/false parameter
  */

  db_api.verUser(req.query.id).then(function(result){

    ////console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+req.get('host')))
    {
        ////console.log("Domain is matched. Information is from Authentic email");
        if(result)
        {
            //////console.log("email is verified");
            //res.send(result);
            res.render("verified");
        }
        else
        {
            //////console.log("email is not verified");
            res.send(result);
        }
    }
    else
    {
        res.send("<h1>Request is from unknown source</h1>");
    }
  })
});


/*
app.use(
  multer({ dest: './uploads/',
    rename: function (fieldname, filename) {
        return filename+Date.now();
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...');
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
}));
*/


/*
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, req.user["_id"]+file.name);
  }
})*/



app.get('/forgotPassword',function(req,res){
  /*
    Renders forgot password page with unique URL linked to their user object.
  */

  // pass along query (user) id when rendering page
  var id = {id: req.query.id};
  console.log("the id: " + id);

  ////console.log(req.protocol+":/"+req.get('host'));
  if((req.protocol+"://"+req.get('host'))==("http://"+req.get('host'))){
    res.render("forgotPassword", {"id": id});
  }

  else {
    res.send("<h1>Request is from unknown source</h1>");
  }

});

/*
var upload = multer({ dest: 'uploads/' });
app.post('/uploadPhoto',upload.single('avatar'),function(req,res){
  console.log(req.file)
  console.log(req)

  res.send(true)

});*/
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
});
var upload = multer({ storage: storage }).single('avatar');

app.post('/uploadPhoto', function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      console.log(err.message);
      // An error occurred when uploading
      return
    }
    console.log('Everything went fine');
    // Everything went fine
  })
})
//console.log(upload.single('photo'))

/*--------------------Routing Over----------------------------

/*
router.post('/', upload.single('photo'), function (req, res, next) {
  // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any

});
router.route("/uploadPhoto")
    .post(upload.single("photo"), function(req, res){
         console.log(req.files[0]);
         res.send(true);
    })
*/

// closing the exports function


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

return app;

};
