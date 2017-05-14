var app = app || {};



var rides=[];

window.onload = function(){
  var tab = document.getElementById("ridePostings").className="active";

  getUser().then(function(userData){

    userData = JSON.parse(userData);
    //console.log('through get user');
    find_all_trips(userData.email).then(function(list_of_trips){

      //console.log('through find all trips');
      list_of_trips = JSON.parse(list_of_trips);
      userData.trips = list_of_trips;
      //console.log('through find all trips');




  var Ride = Backbone.Model.extend({
    defaults:{
  }
  });

  var Rides = Backbone.Collection.extend({
    model:Ride
  });

  var RideView = Backbone.View.extend({

    events: {'click':'toggleDetails','click .btn-primary':'placeBid'},
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

      rideId = this.model.get("_id");
      var confirmButton = document.getElementById('confirmButton');
      console.log("confirmButton");
      console.log(confirmButton);
      confirmButton.addEventListener('click', function(){
        console.log('clicked confirm');
        event.stopPropagation();
        //console.log('in event!!');
        var whichTrip = $('input[name= trip]:checked').val();
        console.log(whichTrip);
        if(whichTrip === "newTrip"){
          console.log('clicked bid button to make a new trip');
          var newName = document.getElementById('newTripName').value;
          bidOnRide(rideId, 1, true, newName);
          $('.modal').modal('hide');
          window.location.reload();
        }else if (whichTrip === undefined){
          console.log('in popover');
          $('#confirmButton').popover('show');
        }else{
          //console.log(rideId);
          //console.log(whichTrip);
          bidOnRide(rideId, whichTrip, false);
          $('.modal').modal('hide');
          window.location.reload();
        }
        //$('.modal').modal('hide');
        //window.location.reload();
      });
    }
    ,
    render: function(){
          if (this.details){
            this.el.innerHTML = this.detailTemplate(this.model.attributes);
            var button = this.el.getElementsByClassName("btn btn-md btn-primary")[0]
            var riders = this.model.attributes.riders;
            var driver = this.model.attributes.driver;
            var bidders = this.model.attributes.potential_riders;
            var attr = this.model.attributes;
            if(_.contains(riders, userData.email) || _.contains(bidders, userData.email) || driver === userData.email){
              button.style.visibility = 'hidden';
            }else{
              template = "<div><p><b><ins>To: #destination#</ins></b> <b><ins>From: #source#</ins></b></p><p><b><ins>Driven by: #driver#</ins></b></p><p><b><ins>Asking for: #asking_price#</ins></b></p><p>If you would like to bid on this ride select a trip to associate the ride with or make a new trip.</p><p>Trips are collections of rides that may accomplish the same function. You can only be accepted for one potential ride per trip at a time</p></div>";
              button.addEventListener('click', function(){
                var rideDesciption = document.getElementById("rideDescription");
                var listItem =template.replace(/#[^#]*#/g,function(substring){
                //this dtermines what value needs to be replaced
                  var property = substring.slice(1,-1);
                  return attr[property];
                });
                var item = document.createElement('h5');
                //inserts the filled template into the the list item
                item.innerHTML = listItem;
                item.id = "rideDescription";
                var a = rideDesciption.parentNode.replaceChild(item, rideDesciption);
                var tripList = document.getElementById("tripList");
                item = document.createElement('li');
                item.class = "boxed";
                var newlist = document.createElement('ul');
                newlist.id = "tripList"
                item.innerHTML = '<div><input type = radio value= newTrip name= trip></input> Start a new trip?  <input type=text placeholder= "New Trip Name" id= newTripName></input></div>';
                newlist.appendChild(item);
                var tripTemplate = '<div id= tripDiv#trip_number#><input type = radio value= #trip_number# name= trip></input> Add bid to trip: #trip_name#<br>Rides:<br><ul class=tripList2></ul></div>';
                var rideTemplate = '<div class= div2>To: #destination#, From: #source#, On: #departure_time#</div>';
                //console.log('before trips loop');
                userData.trips.forEach(function(trp){
                  //console.log('big loop start');
                  if(!trp.isDrive && trp.confirmed_rides.length ===0){
                    //console.log('big loop start');
                    item= document.createElement('li');
                    item.class = "boxed";
                    item.innerHTML = tripTemplate.replace(/#[^#]*#/g,function(substring){
                      //this dtermines what value needs to be replaced
                      var property = substring.slice(1,-1);
                      return trp[property];
                    });
                    //console.log('made trip');
                    //console.log(item);
                    var list = item.getElementsByClassName('tripList2')[0];
                    //console.log(list);
                    trp.potential_rides.forEach(function(ride){
                      //console.log('in little loop');
                      rideItem = document.createElement('li');
                      rideItem.innerHTML = rideTemplate.replace(/#[^#]*#/g,function(substring){
                        //this dtermines what value needs to be replaced
                        var property = substring.slice(1,-1);
                        return ride[property];
                      });
                      list.appendChild(rideItem);
                      //console.log('added little');
                      //console.log(list);
                    })
                    newlist.appendChild(item);
                    //console.log('added big');
                    //console.log(newlist);
                  }
                });
                //console.log('big add');
                //console.log(tripList);
                a = tripList.parentNode.replaceChild(newlist, tripList);
              });
            }
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


  var RideCollectionView = Backbone.View.extend({
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
    ////console.log(myRides);
    var view = new RideCollectionView({collection:myRides});
    try{
      document.getElementById("ridesDiv").appendChild(view.render().el);
    }catch(err){
      //failed use, ignore from myRides
    }

  };

  rides.update = function(){
      var div = document.getElementById("ridesDiv");
      while (div.firstChild) {

        div.removeChild(div.firstChild);
      }
      initialize();


  };


  getRides(false, false, false, false, false).then(function(result){
    rides.list = result;
    initialize();
  });


});
});

};



var getBids = function(url){
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


    request.responseType = 'json';
    request.open('GET',url, true);
    //console.log('opened');

    request.send();
    //console.log('sent');

  });
};


var getRides = function(departTime, arriveTime, start, destination, seats_avail){
  /*
  Finds rides that match search criteria
  */
   ////console.log("in");
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    ////console.log('created request');

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
  var data = {type: "ride", depart: departTime, arrival: arriveTime, from_here: start, destination: destination, seats_avail: seats_avail};

  request.open('POST', '/find_ride', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    //console.log('sent');

  });
};

var find = function(query){
  /*
  Finds what matches object you pass in
  */

  ////console.log("in");
  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      ////console.log('created request');

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
        ////console.log("Response!!!");
        ////console.log(res);
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

    ////console.log("in 2");
    var data = query;

    request.open('POST', '/find_general', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
    /*
    *******************************************************
    */
    ////console.log('sent');

  });
};

var insert = function(query){
  /*
  Finds what matches object you pass in
  */

  //console.log("in");
  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      ////console.log('created request');

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

    request.open('POST', '/insert_general', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
    /*
    *******************************************************
    */
    //console.log('sent');

  });
};

var bidOnRide = function(ride_ID, trip_num, new_trip, tripName){
  /*
  Bid on a ride
  */

  //console.log('in bidOnRide');
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    ////console.log('created request');

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
  var data = {ride_ID: ride_ID, trip_num: trip_num, new_trip: new_trip, tripName: tripName};

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
    ////console.log('created request');

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
    //console.log('sent');

  });
};

var postTrip = function(email){
  /*
  testing our post trip function
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
  //console.log('before data')
  var data = {user: email};
  //console.log('set data');

  request.open('POST', '/tripTests', true);
  //console.log('opened request');
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    //console.log('sent');

  });
};

var find_all_trips = function(user_email){
  /*
  Finds all of a users current trips
  */
  //console.log('in find all');
  return new Promise(function(resolve, reject){
    //console.log('promise back')
    var request = new XMLHttpRequest();
    ////console.log('created request');

    request.addEventListener("load", function() {
      //console.log('loaded');
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
  var data = {user_email: user_email};

  request.open('POST', '/find_all_trips', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    //console.log('sent');

  });
};
var getUser = function(){
  /*
  testing our post rider ride function
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

  request.open('GET', '/user', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send();
  /*
  *******************************************************
  */
    //console.log('sent');

  });
};
