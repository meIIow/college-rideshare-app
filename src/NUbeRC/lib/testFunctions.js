/*
Use this file to make functions for unit testing

These functions will not generally be publically accessible.
*/
module.exports = function(database,bcrypt){



  var db_delete = function(){
    return new Promise(function(resolve, reject){
      database.remove({}).then(function(result){
        if( result> -1){
          //console.log(result)
          resolve(true);
        }else{
          resolve(false);
        }
        });
      }
    )
  };

  var db_remove = function(obj){
    return new Promise(function(resolve, reject){
      database.remove(obj).then(function(result){
        //resolves the object returned
        resolve(result);
        }
      );
    });
  };
//Everything in here will be return in the module
return {
  db_delete: db_delete,
  db_remove: db_remove
};
};

/*
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





var email_ver_request = function(email,password){
  return new Promise(function(resolve, reject){
    //Handle the pedantic networking
    var request = new XMLHttpRequest();
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
    //If
    data = {protocol: password, email: email};
    var request = new XMLHttpRequest();

    request.open('GET', '/verify', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));

    console.log('Sent a email Ver request');
  });
}










/////////////////////////////////////////////////////////////
//Depreciated, No longer works
////////////////////////////////////////////////////////////
// /SEND server side no longer exists
var email_send = function(email,password){
  return new Promise(function(resolve, reject){
    //Handle the pedantic networking
    var request = new XMLHttpRequest();
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
    //If
    data = {protocol: password, email: email};
    var request = new XMLHttpRequest();

    request.open('POST', '/send', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));

    console.log('Sent a email Ver request');
  });
}
*/

// var getRides = function(time, destination){
//   /*
//   Finds rides that match search criteria
//   */
//    console.log("in");
//   return new Promise(function(resolve, reject){
//     var request = new XMLHttpRequest();
//     //console.log('created request');

//     request.addEventListener("load", function() {
//       if (request.status >= 200 && request.status < 400) {
//      resolve(request.response);
//       } else {
//           reject(Error(request.statusText));
//       }
//     });

//     request.addEventListener("error", function(event) {
//     reject(Error("Network error"));
//   });

//   /*
//   *******************************************************
//   use this format for sending information back to the server
//   */

//   console.log("in 2");
//   var data = {time: [1,3], destination: "Boston"};
//   var request = new XMLHttpRequest();
//   request.open('POST', '/find_ride', true);
//   request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//   request.send(JSON.stringify(data));
//   /*
//   *******************************************************
//   */
//     console.log('sent');

//   });
// };




// ///////////////////////////////////
// var app = app || {};

// (function (exports){
//   var rides = [

// {"source":"Middlebury", "destination":"Boston", "departure_time":3, "arrival_time":7},
// {"source":"Middlebury", "destination":"New York", "departure_time":2, "arrival_time":5},
// {"source":"Middlebury", "destination":"Montreal", "departure_time":1, "arrival_time":3},
// {"source":"Middlebury", "destination":"Burlington", "departure_time":7, "arrival_time":8},
// {"source":"Middlebury", "destination":"Philadelphia", "departure_time":8, "arrival_time":12},
// {"source":"Boston", "destination":"Middlebury", "departure_time":1, "arrival_time":5},
// {"source":"New York", "destination":"Middlebury", "departure_time":4, "arrival_time":9},
// {"source":"Montreal", "destination":"Middlebury", "departure_time":2, "arrival_time":4},
// {"source":"Burlington", "destination":"Middlebury", "departure_time":6, "arrival_time":7},
// {"source":"Philadelphia", "destination":"Middlebury", "departure_time":6, "arrival_time":11}];


// var Ride = Backbone.Model.extend({
//   defaults:{
// }
// });

// var Rides = Backbone.Collection.extend({
//   model:Ride
// });

// var RideView = Backbone.View.extend({

//   initialize: function(options){
//     this.simpleTemplate = _.template(document.getElementById('RideTemplate').innerHTML);

//     this.listenTo(this.model, 'change', this.render);
//   },


//   render: function(){

//     this.el.innerHTML = this.simpleTemplate({
//       source: this.model.get('source'),
//       destination: this.model.get('destination')

//     });

//     return this;
//   },
// });


// var RideCollectionView = Backbone.View.extend({
// initialize: function(options){
//   this.collection.forEach(this.addRide, this);
// },

// addRide: function(ride){
// //console.log(movie);
// var rideView = new RideView({model:ride});
// this.el.appendChild(rideView.render().el);
// }

// });



// exports.initialize = function(){

//   var myRides = new Rides(rides);

//   var view = new RideCollectionView({collection:myRides});
//   document.body.appendChild(view.render().el);
// };





// })(app);
