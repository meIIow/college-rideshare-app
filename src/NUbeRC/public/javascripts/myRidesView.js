var app = app || {};

var tab = document.getElementById("myRides").className="active";


(function (exports){
  var rides = [

  /*{"source":"New York", "destination":"Middlebury", "departure_time":4, "arrival_time":9,"driver":"mdreher@middlebury.edu","asking_price":"$20"},
  {"source":"Montreal", "destination":"Middlebury", "departure_time":2, "arrival_time":4,"driver":"Cathy","asking_price":"$30"},
  {"source":"Burlington", "destination":"Middlebury", "departure_time":6, "arrival_time":7,"driver":"Alex","asking_price":"$25"},
  {"source":"Philadelphia", "destination":"Middlebury", "departure_time":6, "arrival_time":11,"driver":"Sarah","asking_price":"$15"}*/
    ];
  var user ={
    email: 'mdreher@middlebury.edu',
    id: 10
  }

  var Ride = Backbone.Model.extend({
    defaults:{
  }
  });

  var Rides = Backbone.Collection.extend({
    model:Ride
  });

  var Drive = Backbone.Model.extend({
    defaults:{
  }
  });

  var Drives = Backbone.Collection.extend({
    model:Drive
  });

  var RideView = Backbone.View.extend({

    events: {'click':'toggleDetails','click .btn-default':'placeBid','click .btn-default2':'placeBid2'},
    details: false,


    initialize: function(options){
      this.simpleTemplate = _.template(document.getElementById('RideTemplate').innerHTML);

      this.detailTemplate = _.template(document.getElementById('RideTemplate_Detailed').innerHTML);

      //this.bidButton = this.detailTemplate(document.getElementById('bid_button').innerHTML);



      this.listenTo(this.model, 'change', this.render);
    },
    placeBid: function(event){
      console.log("in placeBid 1");
      event.stopPropagation();
      var rideID = this.model.attributes._id.toString();
        gettingEmail().then(function(result) {
          var rider_email = result;
          //letting user cancel their potential rides
          document.getElementById("cancelRideButton").addEventListener('click', function(e){
            buttonEvent(rider_email, rideID)
          });
          });
        $('#cancelModal').on('hidden.bs.modal', function () {
          //document.getElementById("cancelRideButton").removeEventListener('click', buttonEvent);
                window.location.reload();
              });
      $('#cancelModal').modal();
      console.log(document.getElementById("cancelRideButton"));

    //var rider_email = gettingEmail();
          //item.getElementsByClassName("cancelButton")[0].addEventListener('click', function(){
          //var rider_email = gettingEmail();
          
      ////console.log(this.model.get('driver'));
    },
    render: function(){
      this.el.innerHTML = this.simpleTemplate({
        source: this.model.get('source'),
        destination: this.model.get('destination'),
        driver: this.model.get('driver'),
      });
        this.el.innerHTML = this.detailTemplate(this.model.attributes);
        return this;

    },

    toggleDetails: function(){
      this.details = ! this.details;
      this.render();
      },
  });


  var RideCollectionView = Backbone.View.extend({
    initialize: function(options){
      this.collection.forEach(this.addRide, this);
    },

    addRide: function(ride){
      var rideView = new RideView({model:ride});
      this.el.appendChild(rideView.render().el);
    }

  });
//----
var RideView_potential = Backbone.View.extend({

  events: {'click':'toggleDetails','click .btn-default':'placeBid','click .btn-default2':'placeBid2'},
  details: false,


  initialize: function(options){
    this.simpleTemplate = _.template(document.getElementById('RideTemplate_potential').innerHTML);

    this.detailTemplate = _.template(document.getElementById('RideTemplate_Detailed_potential').innerHTML);

    //this.bidButton = this.detailTemplate(document.getElementById('bid_button').innerHTML);



    this.listenTo(this.model, 'change', this.render);
  },
  placeBid: function(event){
    console.log("in placeBid 2");
    event.stopPropagation();

    //var rider_email = gettingEmail();
          //item.getElementsByClassName("cancelButton")[0].addEventListener('click', function(){
          //var rider_email = gettingEmail();
          /*gettingEmail().then(function(result) {
          var rider_email = result;
          var rideID = ride._id.toString();
          //letting user cancel their potential rides
          document.getElementById("cancelRideButton").addEventListener('click', function(){
            cancelRide(rider_email, rideID).then(function(result){
            if (result){
              console.log("ride cancelled");
            }else{
              console.log("cancel ride didn't work");
            }
          });
          })
          $('#cancelModal').modal();
          $('#cancelModal').on('hidden.bs.modal', function () {
            window.location.reload();
          });

          });*/
        //});
    ////console.log(this.model.get('driver'));
  },
  render: function(){
    this.el.innerHTML = this.simpleTemplate({
      //source: this.model.get('source'),
      //destination: this.model.get('destination'),
      //driver: this.model.get('driver'),
      trip_name: this.model.get('trip_name'),
      trip_number: this.model.get('trip_number'),
      potential_rides: this.model.get('potential_rides'),
      confirmed_rides: this.model.get('confirmed_rides')
    });
      this.el.innerHTML = this.detailTemplate(this.model.attributes);
      //console.log(this.el);
      var potential_trip_list = this.el.getElementsByClassName("potential_trip_list");
      //console.log(potential_trip_list);
      var rideTemplate = '<p class= paragraph>To: #destination#, From: #source#, On: #departure_time#<br>Driver: #driver# Price: #asking_price#<br><button type=button, class=cancelButton>Cancel Ride</button></p>';
      var list = document.createElement('ul');
      list.class = "potential_trip_list";
      var count =false;
      this.model.get('potential_rides').forEach(function(ride){

        var rideTime = ride.departure_time;
        var date = rideTime.slice(0,10);
        var time = rideTime.slice(-10);
        console.log("Split ride date"+date);
        console.log("Split ride time"+time);
        var driveEpochTime =toEpoch(date,time);
        var timeNow = Math.round(new Date().getTime()/1000.0);

        console.log("Time Now"+timeNow);
        console.log("EpochTime for drive"+driveEpochTime);


        if(timeNow < driveEpochTime){
          var item = document.createElement("li");
          item.innerHTML = rideTemplate.replace(/#[^#]*#/g,function(substring){
            //this dtermines what value needs to be replaced
            var property = substring.slice(1,-1);
            return ride[property];
          });
          item.getElementsByClassName("cancelButton")[0].addEventListener('click', function(){
          //var rider_email = gettingEmail();
          gettingEmail().then(function(result) {
          var rider_email = result;
          var rideID = ride._id.toString();
          //letting user cancel their potential rides
          document.getElementById("cancelRideButton").addEventListener('click', function(){
            cancelRide(rider_email, rideID).then(function(result){
            if (result){
              console.log("ride cancelled");
              $('#cancelModal').modal();
              $('#cancelModal').on('hidden.bs.modal', function () {
                window.location.reload();
              });
            }else{
              console.log("cancel ride didn't work");
            }
          });
          })
          $('#cancelModal').modal();
          $('#cancelModal').on('hidden.bs.modal', function () {
            window.location.reload();
          });

          });
        });
          list.appendChild(item);
          count = true;
        }
      });
      //console.log(potential_trip_list);
      potential_trip_list[0].parentNode.replaceChild(list, potential_trip_list[0]);
      if(!count){
        console.log("this");
        console.log(this);
        this.el.hidden = true;
      }
      return this;

  },

  toggleDetails: function(){
    this.details = ! this.details;
    this.render();
    },
});





var RideCollectionView_potential = Backbone.View.extend({
  initialize: function(options){
    this.collection.forEach(this.addRide, this);
  },

  addRide: function(ride){
    var rideView = new RideView_potential({model:ride});
    this.el.appendChild(rideView.render().el);
  }

});




  var DriveView = Backbone.View.extend({

    events: {'click':'toggleDetails','click .btn-default':'placeBid','click .btn-default2':'placeBid2' ,'click .btn-default3':'placeBid3'},
    details: false,


    initialize: function(options){
      this.simpleTemplate = _.template(document.getElementById('DriveTemplate').innerHTML);

      this.detailTemplate = _.template(document.getElementById('DriveTemplate_Detailed').innerHTML);

      //this.bidButton = this.detailTemplate(document.getElementById('bid_button').innerHTML);

      this.listenTo(this.model, 'change', this.render);
    },


    placeBid3: function(event){
      event.stopPropagation();

      event.stopPropagation();
      var rideID = this.model.attributes._id.toString();
        gettingEmail().then(function(result) {
          var rider_email = result;
          //letting user cancel their potential rides
          document.getElementById("cancelDriveButton").addEventListener('click', function(e){
            buttonEventDrive(rider_email, rideID)
          });
          });
        $('#cancelDriveModal').on('hidden.bs.modal', function () {
          //document.getElementById("cancelRideButton").removeEventListener('click', buttonEvent);
                window.location.reload();
              });
      $('#cancelDriveModal').modal();
      console.log(document.getElementById("cancelDriveButton"));

    },

    placeBid: function(event){
      console.log("in place bid 1 again");
      event.stopPropagation();

      //confirmed_riders = this.model.attributes.riders;
      var riders = this.model.attributes.potential_riders;
      var rideId = this.model.attributes._id;
      var seats = this.model.attributes.number_of_seats;

      $("#acceptModal").modal();
      $('#acceptModal').on('hidden.bs.modal', function () {
        window.location.reload();
      })
      $('#acceptModal').on('shown.bs.modal', function (e) {
         var modal = document.getElementById('acceptModal');
         var modal_width = modal.offsetWidth;
         var template = '<div><div class = div2><img src= #picture# class= img-responsive style= "float: left; max-width: 20%"></img></div><div style="float:right"> <div>Username: #username# </div> <div>Email: #email# </div> <div> Phone: #phone#</div><div>Cleanliness: #driverRatings.cleanliness# Punctuality: #driverRatings.punctuality#</div><button type=button, class=acceptButton>Accept</button></div><div style=clear:both></div></div>';

        var seatNum = document.getElementById("seatNum");
        seatNum.innerHTML = "<span> Number of available seats: "+ seats.toString() +"</span>";
        var bidList = document.getElementById("bidderList");
        var list = document.createElement('ul');

        getBidders(riders).then(function(bids){

          ////console.log('in getBidders then');
          var nbids = JSON.parse(bids);
          nbids.forEach(function(bid){
            var listItem =template.replace(/#[^#]*#/g,function(substring){
              //this dtermines what value needs to be replaced
              var property = substring.slice(1,-1);
              return bid[property];
            });
            var item = document.createElement('li');
            //inserts the filled template into the the list item
            item.innerHTML = listItem;
            var button = item.getElementsByClassName('acceptButton')[0];
            button.addEventListener('click', function(){
              acceptRider(bid.email,rideId.toString()).then(function(){
                seats = seats-1;
                seatNum.innerHTML = "<span> Number of available seats: "+ seats.toString() +"</span>";
                item.style.display = "none";
                if(seats <= 0){

                  var bidList = document.getElementById("bidderList");
                  var list = document.createElement('ul');
                  list.id = "bidderList";
                  item = document.createElement('li');
                  item.innerHTML = '<p>Your car is full.</p>'
                  list.appendChild(item);
                  bidList.parentNode.replaceChild(list, bidList);

                  list.style.display = "none";
                }

              });
            });
            list.appendChild(item);
          });
          list.id = "bidderList";
          var a = bidList.parentNode.replaceChild(list, bidList);
        });
      });

//-------


//----------


    },

    placeBid2: function(event){
      event.stopPropagation();

      var confirmed_riders = this.model.attributes.riders;

      console.log("Confirmed Riders in place bid"+confirmed_riders);
      //riders = this.model.attributes.potential_riders;
      var rideId = this.model.attributes._id;
      var seats = this.model.attributes.number_of_seats;


  //-------

    $("#confirmRidersModal").modal();
    $('#confirmRidersModal').on('hidden.bs.modal', function () {
      window.location.reload();
    })
    $('#confirmRidersModal').on('shown.bs.modal', function (e) {
       var modal = document.getElementById('confirmRidersModal');
       var modal_width = modal.offsetWidth;
       var template = '<div><div class = div2><img src= #picture# class= img-responsive style= "float: left; max-width: 20%"></img></div><div style="float:right"> <div>Username: #username# </div> <div>Email: #email# </div> <div> Phone: #phone#</div><div>Cleanliness: #driverRatings.cleanliness# Punctuality: #driverRatings.punctuality#</div><button type=button, class=Remove>Remove Rider</button></div><div style=clear:both></div></div>';

      var seatNum = document.getElementById("seatNum");
      seatNum.innerHTML = "<span> Number of available seats: "+ seats.toString() +"</span>";
      var bidList = document.getElementById("bidderList_confirmed");
      var list = document.createElement('ul');

      getBidders(confirmed_riders).then(function(bids){
      console.log("bids in placeBid"+bids);

        ////console.log('in getBidders then');
        var nbids = JSON.parse(bids);
        nbids.forEach(function(bid){
          var listItem =template.replace(/#[^#]*#/g,function(substring){
            //this dtermines what value needs to be replaced
            var property = substring.slice(1,-1);
            return bid[property];
          });
          var item = document.createElement('li');
          //inserts the filled template into the the list item
          item.innerHTML = listItem;
          var button = item.getElementsByClassName('Remove')[0];
          button.addEventListener('click', function(){
            acceptRider(bid.email,rideId.toString()).then(function(){
              seats= seats-1;
              seatNum.innerHTML = "<span> Number of available seats: "+ seats.toString() +"</span>";
              item.style.display = "none";
              if(seats <= 0){
                var bidList = document.getElementById("bidderList_confirmed");
                var list = document.createElement('ul');
                list.id = "bidderList_confirmed";
                item = document.createElement('li');
                item.innerHTML = '<p>Your car is full.</p>'
                list.appendChild(item);
                bidList.parentNode.replaceChild(list, bidList);
              }

            });
          });
          list.appendChild(item);
        });
        list.id = "bidderList_confirmed";
        var a = bidList.parentNode.replaceChild(list, bidList);
      });
    });







  //----------


    },

    render: function(){

      var seats = this.model.get('number_of_seats');
      this.el.innerHTML = this.simpleTemplate({
        source: this.model.get('source'),
        destination: this.model.get('destination'),
        driver: this.model.get('driver'),
      });
      ////console.log(this.model.attributes);
        this.el.innerHTML = this.detailTemplate(this.model.attributes);
        ////console.log("seat num:");
        ////console.log(seats);
        if(seats<=0){
          ////console.log('in 0')
          ////console.log(this.el.children[0].getElementsByClassName("btn btn-md btn-default")[0]);
          this.el.children[0].getElementsByClassName("btn btn-md btn-default")[0].style.visibility = 'hidden';
          //.innerHTML.replace(/<button[^#]*button>/g,function(substring){
            //////console.log("in replace")
              //return '';
            //});
        }
        return this;

      }

  });
//------------------------------------------------------------
// confirmed riders for myrides page


var DriveView_confirmed_view = Backbone.View.extend({

  events: {'click':'toggleDetails','click .btn-default2':'placeBid2'},
  details: false,


  initialize: function(options){
    this.simpleTemplate = _.template(document.getElementById('DriveTemplate').innerHTML);

    this.detailTemplate = _.template(document.getElementById('DriveTemplate_Detailed').innerHTML);

    //this.bidButton = this.detailTemplate(document.getElementById('bid_button').innerHTML);

    this.listenTo(this.model, 'change', this.render);
  },

  placeBid2: function(event){
    event.stopPropagation();

    var confirmed_riders = this.model.attributes.riders;

    console.log("Confirmed Riders in place bid"+confirmed_riders);
    //riders = this.model.attributes.potential_riders;
    var rideId = this.model.attributes._id;
    var seats = this.model.attributes.number_of_seats;


//-------

  $("#confirmRidersModal").modal();
  $('#confirmRidersModal').on('hidden.bs.modal', function () {
    window.location.reload();
  })
  $('#confirmRidersModal').on('shown.bs.modal', function (e) {
     var modal = document.getElementById('confirmRidersModal');
     var modal_width = modal.offsetWidth;
     var template = '<div><div class = div2><img src= #picture# class= img-responsive style= "float: left; max-width: 20%"></img></div><div style="float:right"> <div>Username: #username# </div> <div>Email: #email# </div> <div> Phone: #phone#</div><div>Cleanliness: #driverRatings.cleanliness# Punctuality: #driverRatings.punctuality#</div><button type=button, class=Remove>Remove Rider</button></div><div style=clear:both></div></div>';

    var seatNum = document.getElementById("seatNum");
    seatNum.innerHTML = "<span> Number of available seats: "+ seats.toString() +"</span>";
    var bidList = document.getElementById("bidderList_confirmed");
    var list = document.createElement('ul');

    getBidders(confirmed_riders).then(function(bids){
    console.log("bids in placeBid"+bids);

      ////console.log('in getBidders then');
      var nbids = JSON.parse(bids);
      nbids.forEach(function(bid){
        var listItem =template.replace(/#[^#]*#/g,function(substring){
          //this dtermines what value needs to be replaced
          var property = substring.slice(1,-1);
          return bid[property];
        });
        var item = document.createElement('li');
        //inserts the filled template into the the list item
        item.innerHTML = listItem;
        var button = item.getElementsByClassName('Remove')[0];
        button.addEventListener('click', function(){
          acceptRider(bid.email,rideId.toString()).then(function(){
            seats= seats-1;
            seatNum.innerHTML = "<span> Number of available seats: "+ seats.toString() +"</span>";
            item.style.display = "none";
            if(seats <= 0){
              var bidList = document.getElementById("bidderList_confirmed");
              var list = document.createElement('ul');
              list.id = "bidderList_confirmed";
              var item = document.createElement('li');
              item.innerHTML = '<p>Your car is full.</p>'
              list.appendChild(item);
              bidList.parentNode.replaceChild(list, bidList);
            }

          });
        });
        list.appendChild(item);
      });
      list.id = "bidderList_confirmed";
      var a = bidList.parentNode.replaceChild(list, bidList);
    });
  });







//----------


  },

  render: function(){

    var seats = this.model.get('number_of_seats');
    this.el.innerHTML = this.simpleTemplate({
      source: this.model.get('source'),
      destination: this.model.get('destination'),
      driver: this.model.get('driver'),
    });
    ////console.log(this.model.attributes);
      this.el.innerHTML = this.detailTemplate(this.model.attributes);
      ////console.log("seat num:");
      ////console.log(seats);
      if(seats<=0){
        ////console.log('in 0')
        ////console.log(this.el.children[0].getElementsByClassName("btn btn-md btn-default")[0]);
        this.el.children[0].getElementsByClassName("btn btn-md btn-default")[0].style.visibility = 'hidden';
        //.innerHTML.replace(/<button[^#]*button>/g,function(substring){
          //////console.log("in replace")
            //return '';
          //});
      }
      return this;

    }

});



























//------------------------------------------------------------


  var DriveCollectionView = Backbone.View.extend({
    initialize: function(options){
      this.collection.forEach(this.addRide, this);
    },

    addRide: function(ride){
      var driveView = new DriveView({model:ride});
      this.el.appendChild(driveView.render().el);
    }

  });


  exports.initialize = function(){

    //////console.log("you're in initialize");

    var drives = [];
    var realRides = [];
    var potential_rides = [];

    // retrieve username of user currently logged in
    gettingEmail().then(function(userEmail){

      // find from db all rides that have user as driver

      find_all_trips(userEmail).then(function(result){
        var driverRides = [];
        var confirmedRiderRides = [];
        var potentialRiderRides = [];
        res = JSON.parse(result)
        res.forEach(function(trip){
          if(trip.isDrive ===true){
            trip.confirmed_rides.forEach(function(ride){
              var rideTime = ride.departure_time;
              var date = rideTime.slice(0,10);
              var time = rideTime.slice(-10);
              console.log("Split ride date"+date);
              console.log("Split ride time"+time);
              var driveEpochTime =toEpoch(date,time);
              var timeNow = Math.round(new Date().getTime()/1000.0);

              console.log("Time Now"+timeNow);
              console.log("EpochTime for drive"+driveEpochTime);


              if(timeNow < driveEpochTime){
                driverRides.push(ride);
              }

            })
          }else if(trip.confirmed_rides.length !== 0){
            console.log("got a confirmed rides");
            trip.confirmed_rides.forEach(function(ride){
              var rideTime = ride.departure_time;
              var date = rideTime.slice(0,10);
              var time = rideTime.slice(-10);
              console.log("Split ride date"+date);
              console.log("Split ride time"+time);
              var driveEpochTime =toEpoch(date,time);
              var timeNow = Math.round(new Date().getTime()/1000.0);

              console.log("Time Now"+timeNow);
              console.log("EpochTime for drive"+driveEpochTime);


              if(timeNow < driveEpochTime){
                confirmedRiderRides.push(ride);
              }


            })
          }else{
            //trip.potential_rides.forEach(function(ride){
            //  ride.trip_number = trip.trip_number;
            //  ride.trip_name = trip.trip_name;
            potentialRiderRides.push(trip);
            console.log("got here");
            console.log(trip);

          //})

          }
        });


        console.log(driverRides)
        // initialize drives view
        drives.list = driverRides;
        var myDrives = new Drives(drives.list);
        var driveView = new DriveCollectionView({collection:myDrives});
        document.getElementById("myDriveContainer").appendChild(driveView.render().el);

        // initialize rides - for now not done as bids not connected
        realRides.list = confirmedRiderRides;
        console.log("rides list");
        console.log(realRides.list);
        var myRides = new Rides(realRides.list);
        var view = new RideCollectionView({collection:myRides});
        document.getElementById("myConfirmedRideContainer").appendChild(view.render().el);

        potentialRiderRides.sort(function(a, b) {
          return a.trip_number - b.trip_number;
        });
        potential_rides.list = potentialRiderRides;
        console.log("rides list potential");
        console.log(potential_rides.list);
        var myRides_potential = new Rides(potential_rides.list);
        var view_potential = new RideCollectionView_potential({collection:myRides_potential});
        document.getElementById("myPotentialRideContainer").appendChild(view_potential.render().el);


      });


    });

  };


})(app);

var cancelDrive = function(driver_email, ride_ID){
  /*
  A driver cancels a ride
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //////console.log('created request');

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
  var data = {driver_email: driver_email, ride_ID: ride_ID};

  request.open('POST', '/cancel_drive', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    ////console.log('sent');

  });
};



var getBids = function(url){
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


    request.responseType = 'json';
    request.open('GET',url, true);
    ////console.log('opened');

    request.send();
    ////console.log('sent');

  });
};

var buttonEvent=function(rider_email, rideID){
            console.log("button push");
            console.log(rider_email);
            console.log(rideID);
            cancelRide(rider_email, rideID).then(function(result){
            if (result){
              console.log("ride cancelled");
              $('#cancelModal').modal("hide");
            }else{
              console.log("cancel ride didn't work");
            }
          });
        };

var buttonEventDrive=function(rider_email, rideID){
            console.log("button push");
            console.log(rider_email);
            console.log(rideID);
            cancelDrive(rider_email, rideID).then(function(result){
            if (result){
              console.log("ride cancelled");
              $('#cancelDriveModal').modal("hide");
            }else{
              console.log("cancel ride didn't work");
            }
          });
        };

var getRides = function(departTime, arriveTime, start, destination, seats_avail){
  /*
  Finds rides that match search criteria
  */
   //////console.log("in");
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //////console.log('created request');

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
  var data = {type: "ride", depart: departTime, arrival: arriveTime, from_here: start, destination: destination, seats_avail: seats_avail};

  request.open('POST', '/find_ride', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    ////console.log('sent');

  });
};

var find = function(query){
  /*
  Finds what matches object you pass in
  */

  //////console.log("in");
  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      //////console.log('created request');

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
        //////console.log("Response!!!");
        //////console.log(res);
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

    //////console.log("in 2");
    var data = query;

    request.open('POST', '/find_general', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
    /*
    *******************************************************
    */
    //////console.log('sent');

  });
};

var insert = function(query){
  /*
  Finds what matches object you pass in
  */

  ////console.log("in");
  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      //////console.log('created request');

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

    request.open('POST', '/insert_general', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));
    /*
    *******************************************************
    */
    ////console.log('sent');

  });
};

var cancelRide = function(rider_email, ride_ID){
  /*
  A confirmed or potential rider cancels a ride
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //////console.log('created request');

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

  request.open('POST', '/cancel_ride', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    ////console.log('sent');

  });
};


var bidOnRide = function(rider_email, ride_ID, trip_num, new_trip){
  /*
  Bid on a ride
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //////console.log('created request');

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
    ////console.log('sent');

  });

};


var acceptRider = function(rider_email, ride_ID){
  /*
  Accepts a rider
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //////console.log('created request');

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
    ////console.log('sent');

  });
};


var find_all_trips = function(user_email){
  /*
  Finds all of a users current trips
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    //////console.log('created request');

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
  var data = {user_email: user_email};

  request.open('POST', '/find_all_trips', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    ////console.log('sent');

  });
};

var postTrip = function(email){
  /*
  testing our post trip function
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
  ////console.log('before data')
  var data = {user: email};
  ////console.log('set data');

  request.open('POST', '/tripTests', true);
  ////console.log('opened request');
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    ////console.log('sent');

  });
};


// retrieving user email from current session
var gettingEmail = function(){

  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      //////console.log('created request');

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
        ////console.log("Response!!!");
        ////console.log(res);
        resolve(res);
      }
      };
      request.addEventListener("error", function(event) {
          reject(Error("Network error"));
      });

      ////console.log("gettingEmail: got to the email request");
      request.open('GET', '/userEmail', true);
      request.send();
    })



};

var getBidders = function(bidders){

  return new Promise(function(resolve, reject){
      var request = new XMLHttpRequest();
      //////console.log('created request');

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
        ////console.log("Response!!!");
        ////console.log(res);
        resolve(res);
      }
      };
      request.addEventListener("error", function(event) {
          reject(Error("Network error"));
      });

      var data = {bidders: bidders,thing: "thing"};
      request.open('POST', '/getBidders', true);
      request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      request.send(JSON.stringify(data));
    })



};

function toEpoch(date, time) {

	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	var month;
	var year;
	var day;

	var dateString = date;
	var firstSlash = dateString.indexOf("/");
    var secondSlash = dateString.indexOf("/", firstSlash+1);
	month = dateString.slice(0, firstSlash);
	day = dateString.slice(firstSlash + 1, secondSlash);
	year = dateString.slice(secondSlash+1);

	var formattedTime = months[month - 1] + " " + day + ", " + year + " " + time + ":00";
	var myDate = new Date(formattedTime);

	var EpochTime = myDate.getTime()/1000;

	return EpochTime;
}

/*
var postRiderRide = function(email, src, dst, depTime, arrTime, numSeats, tripId){

  testing our post rider ride function

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

  *******************************************************
  use this format for sending information back to the server

  ////console.log('before data')
  var data = {user: email, src: src, dst: dst, depTime: depTime, arrTime: arrTime, numSeats: numSeats, tripId: tripId};
  ////console.log('set data');
  var request = new XMLHttpRequest();
  request.open('POST', '/riderRideTests', true);
  ////console.log('opened request');
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));

  *******************************************************

    ////console.log('sent');

  });
};
*/
