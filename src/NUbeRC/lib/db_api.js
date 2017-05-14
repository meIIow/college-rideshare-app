/*
This file contains our API calls to connect with MONGO.
*/

module.exports = function(mongo,database,bcrypt){
  /*
  modular database connector
  */


  var createUser = function(email, password, username){
    /*
    Should simply generate the user object to be inserted later
    */
  return {
    email: email,
    password: password,
    username: username,
    riderRating: {
      rating1: 0,
      rating2: 0,
      cancellations: 0,
      total_rides: 0
    },
    tripNum: 0,
    currentTrips: [],
    previousTrips: [],
    messages: {},
    driverRatings: {
      cleanliness: "",
      punctuality: ""
    },
    picture:"/images/icon.png",
    phone: "0000000000",
    verified: false
  };
};

  var create_new_user = function(username,email,password){
    /*
    Email is middlebury.edu
    Password confirmation already matched
      Valid enough (lenght, chars....)
      Now encrypted
    USERNAME = NAME
        Check against last name in EMAIL
    */
    var new_user = createUser();
    //console.log(" inside db_api");
      //database.insert({here:"i am"}).then(function(result){console.log(result);resolve(result);});
    return new Promise(function(resolve, reject){
      //console.log("User name = "+username+", password is "+password, "email is "+email);
      //console.log(email+" Inside create user");
      database.find({email:email}).then(function(result){
        //use the promise to wait for a response from database then decide
        //console.log(result);
        var ar = JSON.parse(JSON.stringify(result));

        if(result.length != 0 ){
        //Check if the user is already in the database
        //tell user on front end the account already exists
          console.log(email+" Already in the database");

          resolve(false);
          //now return so that we don't also write it into the database again.
        }else{
          bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(password, salt, function(err, hash) {
                  console.log(email+" Inside bcryptjs");
                var index = username.indexOf("@")
                var new_user = createUser(email, hash, username.slice(0,index));

                database.insert(new_user).then(function(result){resolve(result)});
              });
            });
        }
      });
  });
};

// destination - one or an array
// time - an array containing (one float or an array of two times)

var login = function(email,password){
  /*
  This function should asynchronously check into the database
  and return whether or not the user has entered the correct password to match
  a specific entry with that email
  */
  return new Promise(function(resolve, reject){
    console.log("trying login for email "+email);

    database.find({email:email}).then(function(result){
      //use the promise to wait for a response from database then decide
      //console.log(result);
      //Look at the first index in this array, SHOULD BE UNIQUE
      var user = JSON.parse(JSON.stringify(result))[0];

      if(result.length == 0 ){
      //Check if the user is already in the database
        console.log(email+" not in the database");
        resolve(false);
      }else{
        //email was found in the database, now check password

        if(user.verified){
          bcrypt.compare(password, user.password, function(err, res) {
                // res == true ---- if they match
                if (res){
                  console.log("valid login");
                  resolve(user); //return actual user object
                }
                else{console.log("invalid login");}
                resolve(res);
        });
        }
        else{
          console.log(" not verified")
          resolve(false);
        }

      }
    });
});


};


var verUser = function(id){
  /*
  This function should asynchronously check into the database
  and verify a user
  */
  return new Promise(function(resolve, reject){


       database.update({_id:id},{$set:{verified: true}},resolve(true));



     });
}



var user_exists= function(email){
  /*
  This function will take in an email as a string and check to see if
  there is already a user attached with that email
  */

};

var formatTimes = function (times) { //time range
  /*

  */
    if (times.length === 2) {
      return {$gte: times[0], $lte: times[1]};
    } else {
      return times;
    }
};

var findRide = function(rideRequest) {
  /*
    This should be the general find for grabbing rides from the DB
    Parameters passed in should be in the form of a JSON object
  */

  return new Promise(function(resolve, reject){


  console.log("into findRide");

  console.log(rideRequest);

  var rideQuery = {type: "ride"};

  var objectKeys = ["source", "destination", "arrival_time", "departure_time", "number_of_seats"];

  for (var i = 0; i < objectKeys.length; i ++) {
    if (rideRequest[objectKeys[i]] != false ) {

      if(rideRequest[objectKeys[i]] !== undefined ){
        console.log(rideRequest[objectKeys[i]]);

        if ( objectKeys[i] == "source" || objectKeys[i] == "destination"){

          console.log("source or destination changing");
          rideQuery[objectKeys[i]] = {$regex:new RegExp(rideRequest[objectKeys[i]],"i")};//(new RegExp(rideRequest[objectKeys[i]], "i"));
        }else{
          rideQuery[objectKeys[i]] = (rideRequest[objectKeys[i]]);
        }
    }
  }

  }

  console.log("query");

  if ("departure_time" in rideQuery) {
    rideQuery.departure_time = formatTimes(rideQuery.departure_time);
  }

  if ("number_of_seats" in rideQuery) {
    console.log("there are this many seats: " + typeof(rideQuery.number_of_seats));
    rideQuery.number_of_seats = {$gte: rideQuery.number_of_seats};
  }

  if ("arrival_time" in rideQuery) {
    rideQuery.arrival_time = {$lte: rideQuery.arrival_time};
  }



  console.log("fomatted times");
  console.log(rideQuery);


  //var query = {email: "mwhite@middlebury.edu"};
  //projectionObject = {email: true};

  database.find(rideQuery).then(function(result){
    if (result.length === 0) {
      console.log("not found");
      resolve(result);
    } else {

    for (var k =0; k < result.length; k ++) {
      console.log(result[k].departure_time);
      console.log(result[k].arrival_time);
      result[k].departure_time = fromEpoch(result[k].departure_time);
      result[k].arrival_time = fromEpoch(result[k].arrival_time);
      console.log(result[k].departure_time);
      console.log(result[k].arrival_time);
    }

    var ride = JSON.parse(JSON.stringify(result[0]));
    var ride2 = result[0];

    console.log("find returned " + ride.driver);
    console.log("find returned 2 " + ride2.driver);
    console.log("arrival time is: " + ride.arrival_time);

    //console.log("find returned something" + result.username);
    resolve(result);
  }
  });


  });

};

var find_match = function(query) {
  /*
    this should be a general find for debugging

        NOTE:
          hide before ship
  */

  return new Promise(function(resolve, reject){


  console.log("into find_match");



  //var queryObject = {email: "mwhite@middlebury.edu"};
  var queryObject = query;
  console.log(queryObject);
  //projectionObject = {email: true};

  database.find(queryObject).then(function(result){
    if (result.length === 0) {
      console.log("found nothing");
      resolve(result);
    } else {
    var rides = JSON.parse(JSON.stringify(result[0]));
    console.log("find returned " + rides.username);
    //console.log("find returned something" + rides.username);


    for (var k =0; k < result.length; k ++) {
      if (result[k]["type"] === "ride") {
        result[k].departure_time = fromEpoch(result[k].departure_time);
        result[k].arrival_time = fromEpoch(result[k].arrival_time);
      }
    }

    resolve(result);
    }

  });
  });

};



var insert_object = function(query) {
  /*
    General insert for debugging

    NOTE:
      hide before ship
  */

  return new Promise(function(resolve, reject){


  console.log("into insert_object");



  //var queryObject = {email: "mwhite@middlebury.edu"};
  var insertObject = query;
  console.log(insertObject);
  //projectionObject = {email: true};

  var written = database.insert(insertObject);


  resolve(written);


  });

};

var bid_on_ride = function(rider_email, rideID, tripNum, newTrip, tripName) {
    /*
    Adds rider to potential_riders in Ride object
    Adds ID of Ride object to potential_rides in trip object in currentTrips in User object
     - if newTrip = true, push new trip object to currentTrips, put ride ID in here
     - else, find the trip in current trip and add ride to this
    */
  console.log(rider_email);
  console.log(rideID);

  return new Promise(function(resolve, reject){



    var rideUpdate = {};
    var tripUpdate = {};

    var rideQuery = {_id: rideID};
    var riderQuery = {email: rider_email};

    console.log("in bid_on_ride promise");

    database.find(rideQuery).then(function(result){
        console.log("found ride");

        var ride = JSON.parse(JSON.stringify(result[0]));

        console.log(JSON.stringify(ride));

        var potentialRiders = ride.potential_riders;
        potentialRiders.push(rider_email);

        rideUpdate = {
          $set: {potential_riders: potentialRiders}
        };

        console.log("changed rideUpdate");

        database.update(rideQuery, rideUpdate).then(function(result){
          console.log("Updated Ride Object");
        });

    });

    console.log("out of find ride");



    database.find(riderQuery).then(function(result){
        console.log("foundRider");
        var rider = JSON.parse(JSON.stringify(result[0]));

        var trips = rider.currentTrips;

        console.log(rider);

        if (newTrip) {
          console.log(rideID);
          var potentialRides = [rideID];
          var trip = {
            trip_number: rider.tripNum,
            trip_name: tripName||'TripNumber'+String(rider.tripNum),
            isDrive: false,
            potential_rides: potentialRides,
            confirmed_rides: []
          };
          trips.push(trip);
          tripUpdate = {
            $set: {currentTrips: trips},
            $inc: {tripNum: 1}
          };
        } else {
          var i = 0;
          var match = false;
          while (i < trips.length && !match) {
            console.log('in while');
            console.log(trips[i].trip_number);
            console.log(tripNum);
            if (trips[i].trip_number == tripNum) {
              match = true;
              trips[i].potential_rides.push(rideID);
            }
            i ++;
          }

          if (!match) {
            console.log("no trip matches");
          }
          tripUpdate = {
            $set: {currentTrips: trips},
          };
        }

        database.update(riderQuery, tripUpdate).then(function(result){
          console.log("Updated User Trip");
        });
    });

    resolve(true);

  });
};

var makeTrip = function(owner){
  /*
  This function should take in the driver of a trip and generate a new object for them
  */

  return new Promise(function(resolve, reject){
    var docId;
    database.find({email:owner}).then(function(user){
      console.log(user);
      var insertedDoc = {trip_number: user[0].tripNum, isDrive: true, potential_rides:[], confirmed_rides :[]};
      database.update({email: owner}, {$push:{currentTrips: {$each : [insertedDoc], $position : 0}},$inc: {tripNum: 1}});
      resolve("success");
    });
  });
};

var makeDriverRide = function(driver, src, dst, depTime, arrTime, numSeats, askPrice){

  /*
    Should create a single ride in the given drivers user object that is
    searchable by everyone else, Either explicit use of params or JSON object
  */


  return new Promise(function(resolve, reject){
    console.log("hi Joey");
    var docId;
    database.insert({
      type: "ride",
      cancelled: false,
      potential_drivers: [],
      driver: driver,
      potential_riders: [],
      riders: [],
      past_riders: [],
      source: src,
      destination: dst,
      departure_time:
      depTime,
      arrival_time: arrTime,
      asking_price: askPrice,
      number_of_seats: numSeats}).then(function(insertedDoc){
        //console.log("inserted Stuff");
        //console.log(insertedDoc._id);
        ////console.log(mongo.ObjectID(insertedDoc._id));
  		database.update({email: driver}, {$push:{"currentTrips.0.confirmed_rides": insertedDoc._id.toString()}}).then(function(){resolve(insertedDoc);});

  	})

    ////console.log("worked");
  });

};

var rateRider = function(rider, punctuality, experience){

  /*
    Should create a single ride in the given drivers user object that is
    searchable by everyone else, Either explicit use of params or JSON object
  */


  return new Promise(function(resolve, reject){
    //console.log("hi Joey");


    database.update({email: rider}, {$inc:{"riderRating.rating1": punctuality,"riderRating.rating2": experience,"riderRating.ratingNum": 1}}).then(function(){resolve(insertedDoc);});



    ////console.log("worked");
  });

};

var rateDriver = function(driver, punctuality, cleanliness){

  /*
    Should create a single ride in the given drivers user object that is
    searchable by everyone else, Either explicit use of params or JSON object
  */


  return new Promise(function(resolve, reject){
    //console.log("hi Joey");

    database.update({email: rider}, {$inc:{"driverRating.punctuality": punctuality,"driverRating.cleanliness": cleanliness,"driverRating.ratingNum": 1}}).then(function(){resolve(insertedDoc);});

    });

    //console.log("worked");
  };



function fromEpoch(epochTime) {
  var myDate = new Date(epochTime * 1000);
  var timeString = myDate.toGMTString()+"<br>"+myDate.toLocaleString();

    var carrotIndex = timeString.indexOf(">");
    var formattedTime = timeString.slice(carrotIndex+1);

  return formattedTime;
}



var accept_rider = function(rider_email, rideID){
  /*
  Moves rider email from potential_riders to riders in Ride object
  Decrements number_of_seats by 1
  Moves Ride ID from potential_rides to confirmed_rides in proper trip in User object (must iterate thru current_trips to find trip with Ride ID)
  */

  return new Promise(function(resolve, reject){



    var rideUpdate = {};
    var tripUpdate = {};

    var rideQuery = {_id: rideID};
    var riderQuery = {email: rider_email};

    database.find(rideQuery).then(function(result){
        var ride = JSON.parse(JSON.stringify(result[0]));

        var potentialRiders = ride.potential_riders;
        potentialRiders.splice(potentialRiders.indexOf(rider_email), 1);

        console.log("potential:");
        console.log(potentialRiders);

        var acceptedRiders = ride.riders;
        acceptedRiders.push(rider_email);

        console.log("accepted:");
        console.log(acceptedRiders);

        var numSeats = ride.number_of_seats - 1;

        var rideUpdate = {
          $set: {
          potential_riders: potentialRiders,
          riders: acceptedRiders,
          number_of_seats: numSeats
          }
        };

        database.update(rideQuery, rideUpdate).then(function(result){
          console.log("Updated Ride Object");
        });
    });

    database.find(riderQuery).then(function(result){
        var rider = JSON.parse(JSON.stringify(result[0]));

        var trips = rider.currentTrips;
        var trip;

        var match = false;
        var i = 0;

        while (!match && i < trips.length) {
          var thisTrip = trips[i];
          var j = 0;
          while (!match && j < thisTrip.potential_rides.length) {
            if (thisTrip.potential_rides[j] === rideID) {
              match = true;
              trip = thisTrip;
            }
            j ++;
          }
          i ++;
        }

        if (!match) {
          console.log("didn't find ride in trip");
        }


        var potential = trip.potential_rides;
        var confirmed = trip.confirmed_rides;


        potential.splice(potential.indexOf(rideID), 1);


        for (var m = 0; m < potential.length; m ++) {
          var potential_ride_ID = potential[m];
          database.find({_id: potential_ride_ID}).then(function(result){
            var potentialRide = JSON.parse(JSON.stringify(result[0]));
            var current_ID = potentialRide._id;
            var potentialRideRiders = potentialRide.potential_riders;
            potentialRideRiders.splice(potentialRideRiders.indexOf(rider_email), 1);
            var potentialRidePastRiders = potentialRide.past_riders;
            potentialRidePastRiders.push(rider_email);
            var potentialRideUpdate = {
              $set: {
                potential_riders: potentialRideRiders,
                past_riders: potentialRidePastRiders
              }
            };

            console.log("potential ride id is:" + current_ID);
            console.log(potentialRideUpdate);

            database.update({_id: current_ID}, potentialRideUpdate).then(function(result){
              console.log("Moved an accepted rider from potential to past riders");
            });
          });
        }

        confirmed.push(rideID);

        trip.potential_rides = potential;
        trip.confirmed_rides = confirmed;

        trips[i-1] = trip;

        tripUpdate = {
          $set: {currentTrips: trips}
        };

        database.update(riderQuery, tripUpdate).then(function(result){
          console.log("Updated User Trip");
        });
    });


    resolve(true);


  });
};

var cancel_drive = function(driver_email, rideID) {
  /*
  Adds rider to potential_riders in Ride object
  Adds ID of Ride object to potential_rides in trip object in currentTrips in User object
   - if newTrip = true, push new trip object to currentTrips, put ride ID in here
   - else, find the trip in current trip and add ride to this
  */
  return new Promise(function(resolve, reject){

    var rideQuery = {_id: rideID};

    var ride;

    var cancelled_confirmed_riders;
    var cancelled_potential_riders;
    var cancelled_past_riders;

    database.find(rideQuery).then(function(result){
        if (result.length === 0) {
          resolve(false);
        }

        ride = JSON.parse(JSON.stringify(result[0]));

        cancelled_potential_riders = ride.potential_riders;
        cancelled_confirmed_riders = ride.riders;
        cancelled_past_riders = ride.past_riders;

        console.log("cancelled potential riders: " + cancelled_potential_riders);
        console.log("cancelled confirmed riders: " + cancelled_confirmed_riders);
        console.log("cancelled past riders: " + cancelled_past_riders);


        database.update(rideQuery, {$set: {cancelled: true}}).then(function(result){
          console.log("cancelled the ride");

        });

        for (var l = 0; l < cancelled_potential_riders.length; l ++) {
          update_cancelled_rider(false, cancelled_potential_riders[l], rideID);
          //console.log("updated cancelled potential riders");
        }

        for (var m = 0; m < cancelled_past_riders.length; m ++) {
          update_cancelled_rider(false, cancelled_past_riders[m], rideID);
          //console.log("updated cancelled past riders");
        }

        for (var n = 0; n < cancelled_confirmed_riders.length; n ++) {
          update_cancelled_rider(true, cancelled_confirmed_riders[n], rideID);
          //console.log("updated cancelled confirmed riders")
        }

        resolve(ride);

    });

  });
};

function update_cancelled_rider(confirmed, rider_email, rideID) {

  console.log("into update_cancelled_rider");

  var riderQuery = {email: rider_email};

  database.find(riderQuery).then(function(result){
    console.log("into update_cancelled_ride promise");
    var rider = JSON.parse(JSON.stringify(result[0]));

    var trips = rider.currentTrips;

    var trip;

    var match = false;
    var i = 0;

    var ride_type;

    if (confirmed) {
      ride_type = "confirmed_rides";
    } else {
      ride_type = "potential_rides";
    }

    console.log("ride type is: " + ride_type);

    while (!match && i < trips.length) {
      var thisTrip = trips[i];
      var j = 0;
      while (!match && j < thisTrip[ride_type].length) {
        if (thisTrip[ride_type][j] === rideID) {
          match = true;
          trip = thisTrip;
        }
        j ++;
      }
      i ++;
    }

    console.log(trip);


    if (!match) {
      console.log("didn't find ride in trip for a cancelled_rider");
    }

    else {
      console.log("found ride in a trip for cancelled rider");
      var potentialRides = trip.potential_rides;
      var confirmedRides = trip.confirmed_rides;
      if (!confirmed) {
        potentialRides.splice(potentialRides.indexOf(rideID), 1);
        console.log("spliced out that cancelled ride");
      } else { // this is still untested
        confirmedRides.splice(confirmedRides.indexOf(rideID), 1);
        console.log("spliced out that confirmed ride")
        for (var k = 0; k < potentialRides.length; k ++) {
          var potential_ride_ID = potentialRides[k];
          database.find({_id: potential_ride_ID}).then(function(result){
            var potentialRide = JSON.parse(JSON.stringify(result[0]));
            var current_ID = potentialRide._id;
            console.log("potentialRide is:" + potentialRide);
            var potentialRideRiders = potentialRide.potential_riders;
            potentialRideRiders.unshift(rider_email);
            var potentialRidePastRiders = potentialRide.past_riders;
            potentialRidePastRiders.splice(potentialRidePastRiders.indexOf(rider_email), 1);
            var potentialRideUpdate = {
              $set: {
                past_riders: potentialRidePastRiders,
                potential_riders: potentialRideRiders,
              }
            };
            database.update({_id: current_ID}, potentialRideUpdate).then(function(result){
              console.log("pushed cancelled_confirmed_rider to front of a potential ride");
            });
          });
        }
      }
      trips[i-1].potential_rides = potentialRides;
      trips[i-1].confirmed_rides = confirmedRides;
      var riderUpdate = {$set: {currentTrips: trips}};
      database.update(riderQuery, riderUpdate).then(function(result){
        console.log("removed cancelled ride from a potential rider");
      });
    }
  });
}

var cancel_ride = function(rider_email, rideID) {
  /*
  Adds rider to potential_riders in Ride object
  Adds ID of Ride object to potential_rides in trip object in currentTrips in User object
   - if newTrip = true, push new trip object to currentTrips, put ride ID in here
   - else, find the trip in current trip and add ride to this
  */
  return new Promise(function(resolve, reject){

    console.log("into cancel_ride");
    var success1 = false;
    var success2 = false;
    var rideUpdate = {};
    var tripUpdate = {};
    var rideQuery = {_id: rideID};
    var riderQuery = {email: rider_email};
    var alreadyConfirmed;

    console.log("rider email is: " + rider_email);
    console.log("ride to be cancelled is: " + rideID);

    database.find(riderQuery).then(function(result){
      success1 = true;
      if (result.length === 0) {
        console.log("did not find user");
        success = false;
      } else {

        var rider = JSON.parse(JSON.stringify(result[0]));
        console.log("found rider: " + rider);
        var trips = rider.currentTrips;
        var trip;
        var confRides;
        var potenRides;

        var match = false;
        var i = 0;

        while (!match && i < trips.length) {
          var thisTrip = trips[i];
          var j = 0;
          while (!match && j < thisTrip.potential_rides.length) {
            if (thisTrip.potential_rides[j] === rideID) {
              match = true;
              trip = thisTrip;
              potenRides = trip.potential_rides;
              potenRides.splice(j,1);
              confRides = trip.confirmed_rides;
              alreadyConfirmed = false;
            }
            j ++;
          }
          var k = 0;
          while (!match && k < thisTrip.confirmed_rides.length) {
            if (thisTrip.confirmed_rides[k] === rideID) {
              match = true;
              trip = thisTrip;
              confRides = trip.confirmed_rides;
              confRides.splice(k,1);
              potenRides = trip.potential_rides;
              alreadyConfirmed = true;
            }
            k ++;
          }
          i ++;
        }

        if (!match) {
          console.log("no trip matches");
          success = false;
        } else {
          trips[i-1].potential_rides = potenRides;
          trips[i-1].confirmed_rides = confRides;
          tripUpdate = {$set: {currentTrips: trips}};

          database.update(riderQuery, tripUpdate).then(function(result){
            console.log("Remove Ride From User Trip");
          });

        }
      }
    });

    database.find(rideQuery).then(function(result){
      console.log("into second half of cancel ride")
      success2 = true;
      if (result.length === 0) {
        console.log("could not find ride");
        success2 = false;
      } else {
        var ride = JSON.parse(JSON.stringify(result[0]));
        var num_seats = ride.number_of_seats;
        var riderListParam;

        console.log("found ride");


          if (ride.potential_riders.indexOf(rider_email) > -1) {
            console.log("potential");
            riderListParam = "potential_riders";
          } else if (ride.past_riders.indexOf(rider_email) > -1) {
            console.log("past");
            riderListParam = "past_riders";
          } else if (ride.riders.indexOf(rider_email) > -1){
            console.log("confirmed");
            riderListParam = "riders";
            num_seats ++;
          } else {
            console.log("did not find user in ride");
            success2 = false;
          }

        if (success2 === true) {
          var riderList = ride[riderListParam];
          riderList.splice(riderList.indexOf(rider_email), 1);

          rideUpdate = {$set: {number_of_seats: num_seats}};
          rideUpdate.$set[riderListParam] = riderList;
          console.log(rideUpdate);

          database.update(rideQuery, rideUpdate).then(function(result){
            console.log("Removed rider from ride");
          });
        } else {
          success2 = false;
          console.log("could not find user in ride");
        }
      }

      resolve([success1, success2]);
    });

  });

};


/**
* A function that returns a promise that holds a list of all of the
* user's trips (both rides and drives).
* @param {string} userEmail - the current user's email.
*/
var find_all_trips = function(userEmail){
  console.log("into find_all_trips");

  return new Promise(function(resolve, reject){

  console.log("Finding current trips");

  //finding the user's object
  database.find({email:userEmail}).then(function(result){
      if (result.length === 0) {
        console.log("found nothing");
        resolve(result);
      } else {
        //grabs the user's object
        var myUserObject = JSON.parse(JSON.stringify(result[0]));
        var myCurrentTrips = myUserObject.currentTrips;
        var potentialRides = [];
        var confirmedRides = [];

        for (var i = 0; i < myCurrentTrips.length; i++){
          var thisTrip = myCurrentTrips[i];

          console.log(thisTrip)
          //replacing the ride IDs in potential rides array with the full ride object
          for(var j = 0; j < thisTrip.potential_rides.length; j++){
            var thisPotenRide = thisTrip.potential_rides[j];

            potentialRides.push(thisPotenRide);
          }

          console.log('middle of the find all trips ');
          //replacing the ride IDs in confirmed rides array with the full ride object

          for(var k = 0; k < thisTrip.confirmed_rides.length; k++){
            var thisConfirmRide = thisTrip.confirmed_rides[k];
            confirmedRides.push(thisConfirmRide);
          }
        }
        findMultiRide(potentialRides).then(function(potRides){

          findMultiRide(confirmedRides).then(function(confRides){
            for (var n = 0; n < myCurrentTrips.length; n++){
              var tripThis = myCurrentTrips[n];
              for(var m = 0; m < tripThis.potential_rides.length; m++){
                var thisPotRide = tripThis.potential_rides[m];
                for(var x = 0; x < potRides.length; x++){
                  if(thisPotRide === potRides[x]._id.toString()){
                    tripThis.potential_rides[m]=potRides[x]
                  }
                }
              }
              for(var z = 0; z < tripThis.confirmed_rides.length; z++){
                var thisConfRide = tripThis.confirmed_rides[z];
                for(var y = 0; y < confRides.length; y++){
                  if(thisConfRide === confRides[y]._id.toString()){
                    tripThis.confirmed_rides[z]=confRides[y]
                  }
                }
              }
              myCurrentTrips[n]=tripThis;
            }
          //console.log(myCurrentTrips);

          //converting the epoch times back to standard time to be displayed
          for (var r = 0; r < myCurrentTrips.length; r++){
            var currentTrip = myCurrentTrips[r];
            for (var h = 0; h < currentTrip.potential_rides.length; h++){
              currentTrip.potential_rides[h].departure_time = fromEpoch(currentTrip.potential_rides[h].departure_time);
              currentTrip.potential_rides[h].arrival_time = fromEpoch(currentTrip.potential_rides[h].arrival_time);
            }
            for (var l = 0; l < currentTrip.confirmed_rides.length; l++){
              currentTrip.confirmed_rides[l].departure_time = fromEpoch(currentTrip.confirmed_rides[l].departure_time);
              currentTrip.confirmed_rides[l].arrival_time = fromEpoch(currentTrip.confirmed_rides[l].arrival_time);
            }
          }

          resolve(myCurrentTrips);
        });});
      }
    });
  });
};



//placeholder find function just to be able to find a user by email quickly
var findProfile = function(email){
  /*
    Used for finding data about users ---- should not return entire user object.
    Only pass back client visible params --- ie, only give users email, username,
    ratings, picture, and phone number.
  */

  return new Promise(function(resolve, reject){

    database.find({email:email}).then(function(result){

      var user = JSON.parse(JSON.stringify(result))[0];
      if (result.length === 0){
        resolve(false);
      }
      else{
        //console.log("dbapi find test: " + user.email + " " + user.password);
        var profile={
          email: user.email,
          username: user.username,
          driverRatings: user.driverRatings,
          picture: user.picture,
          phone: user.phone
        };

        resolve(profile);
      }

    });

  });
};

var findMultiProfile = function(emails){
  console.log('in multifind');

  return new Promise(function(resolve, reject){
    console.log('in promise');
    query =[];
    profiles=[];
    emails.forEach(function(email){
      console.log('making query');
      query.push({email: email})
    })
    console.log('made query');
    console.log(query);
    console.log("{$or: query }");
    if (query.length === 0) {
      reolve(false);
    } else {
    database.find({$or: query }).then(function(result){
      console.log('in find then');
      console.log(result);
      if (result.length === 0){
        console.log('result nonexistant');
        resolve(false);
      }
      else{
        console.log('in else');
        var num = 0;
        result.forEach(function(resu){
          num = num+1;
          console.log(num);
          console.log('in for each');
          var user = JSON.parse(JSON.stringify(resu));
          var profile={
            email: user.email,
            username: user.username,
            driverRatings: user.driverRatings,
            picture: user.picture,
            phone: user.phone
          };
          console.log('profile');
          console.log(profile);
          profiles.push(profile);
        });
        console.log('about to resolve');
        resolve(profiles);
      }
    });
    }
  });
};

var findMultiRide = function(rideIds){
  console.log('in multifind');

  return new Promise(function(resolve, reject){
    console.log('in promise');
    query =[];
    profiles=[];
    rideIds.forEach(function(rideId){
      console.log('making query');
      query.push({_id: rideId})
    })
    console.log('made query');
    console.log(query);
    console.log("{$or: query }");

    if(query.length === 0){
      console.log('in if');
      resolve(false);
    }

    database.find({$or: query }).then(function(result){
      console.log('in find then');
      if (result.length === 0){
        console.log('result nonexistant');
        resolve(false);
      }
      else{
        console.log('in else');
        console.log('about to resolve');
        console.log(result);
        resolve(result);
      }
    });
  });
};

var edit_profile = function(email, username, phoneNumber){
  /*
    Used to update user profile's username and phone number IF username available. Resolves either true/false if edit successful
  */
  return new Promise(function(resolve, reject){
    database.update({email:email}, {$set: {username: username, phone:phoneNumber}}).then(function(res){
      resolve("true");
    });
  });
};



var change_password = function(email, oldPassword, newPassword){
  /*
    Used to change user's password if they also put in valid old password. Resolves either true/false depending on success
  */

  return new Promise(function(resolve, reject){

    // use existing db login function to check old credentials
    login(email, oldPassword).then(function(user){
      // if incorrect, return false
      if (user === false){
        console.log("bad credentials");
        resolve(false);
      }

      // if correct
      else{
        console.log('good credentials');
        // encrypt password
        bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(newPassword, salt, function(err, hash) {
                console.log(email+" Inside bcryptjs");
                database.update({email:email}, {$set:{password:hash}}).then(function(result){resolve(true)}); // update user password in db
              });
        });
      }


    })
  });

};

return {
  create_new_user : create_new_user,
  user_exists: user_exists,
  login: login,
  find_ride: findRide,
  find_match: find_match,
  insert_object: insert_object,
  bid_on_ride: bid_on_ride,
  accept_rider: accept_rider,
  cancel_drive: cancel_drive,
  cancel_ride: cancel_ride,
  verUser:verUser,
  makeDriverRide: makeDriverRide,
  makeTrip:makeTrip,
  find_all_trips: find_all_trips,
  findProfile: findProfile,
  findMultiProfile:findMultiProfile,
  edit_profile: edit_profile,
  change_password: change_password
  };
};
