window.addEventListener('load', function(){
	var searchForm = document.getElementById('searchModal');
	var postForm = document.getElementById('postModal');

	var dest = document.getElementById('searchDest');
	var start = document.getElementById('searchStart');
	//var headerDest = document.getElementById('headerDest');
	//var headerStart = document.getElementById('headerStart');
	//var headerDest2 = document.getElementById('headerDest2');
	//var headerStart2 = document.getElementById('headerStart2');
	var inputArrive = document.getElementById('searchArrive'); //arrival day
	var inputLeave = document.getElementById('searchLeave'); //departure day


	//for basic search bar
	var searchBasicStart = document.getElementById('searchBasicStart');
	var searchBasicDest = document.getElementById('searchBasicDest');
	var searchBasicInputStart = "";
	var searchBasicInputDest = "";

	//listening for the basic search start point input
	searchBasicStart.addEventListener('input', function(){
		searchBasicInputStart = searchBasicStart.value;
	});

	//listening for the basic search destination input
	searchBasicDest.addEventListener('input', function(){
		searchBasicInputDest = searchBasicDest.value;
	});

	//displays the basic search results when "go" button clicked
	searchBasicButton.addEventListener('click', function(){
		searchBasicInputDest = searchBasicDest.value;
		searchBasicInputStart = searchBasicStart.value;
		getRides(false, false, searchBasicInputStart, searchBasicInputDest, false).then(function(result){
		if (result){
			rides.list = result;
			rides.update();
		}else{
			console.log("Failed to get rides")
		}
		});
	});

	//displays the basic search results when enter key pressed
	$(document).keypress(function(e) {

	  if(e.which == 13) {
			//enter was pressed, now need to determine what state the page is in
			if(searchForm.style.display=="block"){
	      getRides(false, false, searchBasicInputStart, searchBasicInputDest, false).then(function(result){
					if (result){
						rides.list = result;
						rides.update();
					}else{
						console.log("Failed to get rides")
					}
			});
		}
			else if(postForm.style.display=="block"){

			}
				e.preventDefault();
			}
    });

	//use event listener to edit the dynamic destination header
	dest.addEventListener('input', function(){
		headerDestFind.innerHTML = dest.value;
		//headerStart2.innerHTML = headerDest.innerHTML;
		if(headerDestFind.innerHTML == ""){
			headerDestFind.innerHTML = "Destination";
			//headerStart2.innerHTML = "Start";
		}
	});

	//use event listener to edit the dynamic start header
	start.addEventListener('input', function(){
		headerStartFind.innerHTML = start.value;
		//headerDest2.innerHTML = headerStart.innerHTML;
		if(headerStartFind.innerHTML == ""){
			headerStartFind.innerHTML = "Start";
			//headerDest2.innerHTML = "Destination";
		}
	});
	document.getElementById("searchRide").addEventListener('click',function(event) {

    event.preventDefault();
})

	var searchButton = document.getElementById('searchRideButton');
	searchButton.addEventListener('click', function(){

		var dest = document.getElementById('searchDest').value;
		var start = document.getElementById('searchStart').value;
		var seats = parseInt(document.getElementById('numSeats').value);

		var leaveDay = document.getElementById('searchLeave').value;
		var leaveTime = [document.getElementById('searchLeaveTime1').value, document.getElementById('searchLeaveTime2').value];

		var arriveDay = document.getElementById('searchArrive').value;
		var arriveTime = document.getElementById('searchArriveTime').value;

		var leave;
		var arrive;

		if(!arriveDay){
			arrive = false;  //arriveDay = leaveDay
		} else if (!arriveTime) {
			arrive = toEpoch(arriveDay, "23:59");
		} else {
			arrive = toEpoch(arriveDay, arriveTime);
		}

		if (!leaveDay) {
			leave = false;
		} else if (!leaveTime) {
			leave = [toEpoch(leaveDay, "00:00"), toEpoch(leaveDay, "23:59")];
		} else {
			leave = [toEpoch(leaveDay, leaveTime[0]), toEpoch(leaveDay, leaveTime[1])];
		}


		if(!dest){
			dest = false;
		}
		if(!start){
			start = false;
		}
		if(!seats){
			seats = false;
		}


		//change leaveTime and arriveTime to be absolute time (both day and time together)
		getRides(leave, arrive, start, dest, seats).then(function(result){
		if (result){
			rides.list = result;
			rides.update();
		}else{
			console.log("Failed to get rides")
		}

		});

		$('.modal').modal('hide');

	});
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

var getRides = function(departTime, arriveTime, start, destination, seats_avail){
  /*
  Finds rides that match search criteria
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
  var data = {type: "ride", depart: departTime, arrival: arriveTime, from_here: start, destination: destination, seats_avail: seats_avail};
	console.log(data)
  request.open('POST', '/find_ride', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    console.log('sent');

  });
};
