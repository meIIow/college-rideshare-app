var app = app || {};

/*  var rides = [

  {"source":"Middlebury", "destination":"Boston", "departure_time":3, "arrival_time":7, "driver":"Jonny", "asking_price":"$25"},
  {"source":"Middlebury", "destination":"New York", "departure_time":2, "arrival_time":5,"driver":"Ted","asking_price":"$35"},
  {"source":"Middlebury", "destination":"Montreal", "departure_time":1, "arrival_time":3,"driver":"Billy","asking_price":"$15"},
  {"source":"Middlebury", "destination":"Burlington", "departure_time":7, "arrival_time":8,"driver":"Craig","asking_price":"$45"},
  {"source":"Middlebury", "destination":"Philadelphia", "departure_time":8, "arrival_time":12,"driver":"Allen","asking_price":"$50"},
  {"source":"Boston", "destination":"Middlebury", "departure_time":1, "arrival_time":5,"driver":"Chris","asking_price":"$10"},
  {"source":"New York", "destination":"Middlebury", "departure_time":4, "arrival_time":9,"driver":"Mark","asking_price":"$20"},
  {"source":"Montreal", "destination":"Middlebury", "departure_time":2, "arrival_time":4,"driver":"Cathy","asking_price":"$30"},
  {"source":"Burlington", "destination":"Middlebury", "departure_time":6, "arrival_time":7,"driver":"Alex","asking_price":"$25"},
  {"source":"Philadelphia", "destination":"Middlebury", "departure_time":6, "arrival_time":11,"driver":"Sarah","asking_price":"$15"}
];
var fake =   [{"source":"Philadelphia", "destination":"Middlebury", "departure_time":6, "arrival_time":11,"driver":"Sarah","asking_price":"$15"}];
*/

var rides=[];

window.onload = function(){




  var Ride = Backbone.Model.extend({
    defaults:{
  }
  });

  var Rides = Backbone.Collection.extend({
    model:Ride
  });

  var RideView = Backbone.View.extend({

    events: {'click':'toggleDetails','click .btn-default':'placeBid'},
    details: false,


    initialize: function(options){
      this.simpleTemplate = _.template(document.getElementById('RideTemplate').innerHTML);

      this.detailTemplate = _.template(document.getElementById('RideTemplate_Detailed').innerHTML);

      //this.bidButton = this.detailTemplate(document.getElementById('bid_button').innerHTML);

      this.listenTo(this.model, 'change', this.render);
    },
    placeBid: function(event){
      event.stopPropagation();

      $("#bidModal").modal();

      console.log(this.model.get('driver'));
    }
    ,
    render: function(){
          if (this.details){
            this.el.innerHTML = this.detailTemplate(this.model.attributes);
          }
         else{
            this.el.innerHTML = this.simpleTemplate({
            source: this.model.get('source'),
            destination: this.model.get('destination'),
            driver: this.model.get('driver')
        });

        return this;
      }
      },

      toggleDetails: function(){
      this.details = ! this.details;
      this.render();
    },
  });



  var RideCollectionView_New = Backbone.View.extend({
  initialize: function(options){
    //this.collection.set(new RideView({model:this}));
    //this.collection.forEach(this.resetView, this);
    //this.collection.forEach(this.addRide, this);
    this.resetView(this);


  },

  addRide: function(ride){
    var rideView = new RideView({model:ride});
    this.el.appendChild(rideView.render().el);
  },

  resetView: function(){
    var view = this;
    this.collection.forEach(function(ride){
      view.addRide(ride);
    });
  }

  });



  initialize = function(){

    var myRides = new Rides(rides.list);
    //console.log(myRides);
    var view = new RideCollectionView_New({collection:myRides});

    document.getElementById("myRideContainer").appendChild(view.render().el);

    };

  rides.update = function(){
      var div = document.getElementById("myRideContainer");

      while (div.firstChild) {

        div.removeChild(div.firstChild);
      }

      initialize();


  };

  console.log("Above Session Email creation");

   var session_email = '';

   gettingEmail().then(function(result){
     console.log("In gettingEmail, iniialize:");
     session_email = result;
     console.log("session email:"+ session_email);
   });

  find({type:"ride", driver: session_email}).then(function(result){
    rides.list = result;
    initialize();
  });


}

// getting user Email from Session

var gettingEmail = function(){

  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      //console.log('created request');

      request.addEventListener("load", function() {
          if (request.status >= 200 && request.status < 400) {
         resolve(request.response);
          } else {
              reject(Error(request.statusText));
          }
      });
      request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = request.responseText;
        console.log("Response!!!");
        console.log(res);
        resolve(res);
      }
      };
      request.addEventListener("error", function(event) {
          reject(Error("Network error"));
      });

      console.log("gettingEmail: got to the email request");
      request.open('GET', '/userEmail', true);
      request.send();
    })



};



var getBids = function(url){
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    console.log('created request');



    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 400) {
     resolve(request.response);
      } else {
          reject(Error(request.statusText));
      }
    });

    request.addEventListener("error", function(event) {
    reject(Error("Network error"));
  });


    request.responseType = 'json';
    request.open('GET',url, true);
    console.log('opened');

    request.send();
    console.log('sent');

  });
};


var getRides = function(departTime, arriveTime, start, destination, seats_avail){
  /*
  Finds rides that match search criteria
  */
   //console.log("in");
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //console.log('created request');

    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 400) {
     resolve(request.response);
      } else {
          reject(Error(request.statusText));
      }
    });


      request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        console.log("Response!!!");
        console.log(res);
        resolve(res);
      }
      };

    request.addEventListener("error", function(event) {
    reject(Error("Network error"));
    });

  /*
  *******************************************************
  use this format for sending information back to the server
  */

  console.log("in 2");
  var data = {type: "ride", depart: departTime, arrival: arriveTime, from_here: start, destination: destination, seats_avail: seats_avail};

  request.open('POST', '/find_ride', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    console.log('sent');

  });
};

var find = function(query){
  /*
  Finds what matches object you pass in
  */

  //console.log("in");
  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      //console.log('created request');

      request.addEventListener("load", function() {
          if (request.status >= 200 && request.status < 400) {
         resolve(request.response);
          } else {
              reject(Error(request.statusText));
          }
      });


      request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        //console.log("Response!!!");
        //console.log(res);
        resolve(res);
      }
      };
      request.addEventListener("error", function(event) {
          reject(Error("Network error"));
      });

    /*
    *******************************************************
    use this format for sending information back to the server
    */

    //console.log("in 2");
    var data = query;

    request.open('POST', '/find_general', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
    /*
    *******************************************************
    */
    //console.log('sent');

  });
};

var insert = function(query){
  /*
  Finds what matches object you pass in
  */

  console.log("in");
  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      //console.log('created request');

      request.addEventListener("load", function() {
          if (request.status >= 200 && request.status < 400) {
         resolve(request.response);
          } else {
              reject(Error(request.statusText));
          }
      });


      request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        console.log("Response!!!");
        console.log(res);
        resolve(res);
      }
      };
      request.addEventListener("error", function(event) {
          reject(Error("Network error"));
      });

    /*
    *******************************************************
    use this format for sending information back to the server
    */

    console.log("in 2");
    var data = query;

    request.open('POST', '/insert_general', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
    /*
    *******************************************************
    */
    console.log('sent');

  });
};

var bidOnRide = function(rider_email, ride_ID, trip_num, new_trip){
  /*
  Bid on a ride
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //console.log('created request');

    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 400) {
     resolve(request.response);
      } else {
          reject(Error(request.statusText));
      }
    });


    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        console.log("Response!!!");
        console.log(res);
        resolve(res);
      }
      };

    request.addEventListener("error", function(event) {
    reject(Error("Network error"));
  });

  /*
  *******************************************************
  use this format for sending information back to the server
  */
  var data = {rider_email: rider_email, ride_ID: ride_ID, trip_num: trip_num, new_trip: new_trip};

/*
  $('#loginform').submit(function(event){
  // prevent default browser behaviour
  event.preventDefault();
  var email = document.getElementById('inputEmail').value;
  var password = document.getElementById('inputPassword').value;
  request_login(email, password);

  });
*/request.open('POST', '/bid_on_ride', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    console.log('sent');

  });

};


var acceptRider = function(rider_email, ride_ID){
  /*
  Accepts a rider
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //console.log('created request');

    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 400) {
     resolve(request.response);
      } else {
          reject(Error(request.statusText));
      }
    });

    request.addEventListener("error", function(event) {
    reject(Error("Network error"));
  });

  /*
  *******************************************************
  use this format for sending information back to the server
  */
  var data = {rider_email: rider_email, ride_ID: ride_ID};

  request.open('POST', '/accept_rider', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    console.log('sent');

  });
};

var postTrip = function(email){
  /*
  testing our post trip function
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    console.log('created request');

    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 400) {
     resolve(request.response);
      } else {
          reject(Error(request.statusText));
      }
    });


    request.addEventListener("error", function(event) {
    reject(Error("Network error"));
  });

  /*
  *******************************************************
  use this format for sending information back to the server
  */
  console.log('before data')
  var data = {user: email};
  console.log('set data');

  request.open('POST', '/tripTests', true);
  console.log('opened request');
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    console.log('sent');

  });
};

var postDriverRide = function(email, src, dst, depTime, arrTime, numSeats, trip, askPrice){
  /*
  testing our post rider ride function
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    console.log('created request');



    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 400) {
     resolve(request.response);
      } else {
          reject(Error(request.statusText));
      }
    });

    request.addEventListener("error", function(event) {
    reject(Error("Network error"));
  });

  /*
  *******************************************************
  use this format for sending information back to the server
  */
  console.log('before data')
  var data = {user: email, src: src, dst: dst, depTime: depTime, arrTime: arrTime, numSeats: numSeats, trip: trip};
  console.log('set data');
  var request = new XMLHttpRequest();
  request.open('POST', '/driverRideTests', true);
  console.log('opened request');
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    console.log('sent');

  });
};

/*
var postRiderRide = function(email, src, dst, depTime, arrTime, numSeats, tripId){

  testing our post rider ride function

  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    console.log('created request');



    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 400) {
     resolve(request.response);
      } else {
          reject(Error(request.statusText));
      }
    });

    request.addEventListener("error", function(event) {
    reject(Error("Network error"));
  });

  *******************************************************
  use this format for sending information back to the server

  console.log('before data')
  var data = {user: email, src: src, dst: dst, depTime: depTime, arrTime: arrTime, numSeats: numSeats, tripId: tripId};
  console.log('set data');
  var request = new XMLHttpRequest();
  request.open('POST', '/riderRideTests', true);
  console.log('opened request');
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));

  *******************************************************

    console.log('sent');

  });
};
*/
