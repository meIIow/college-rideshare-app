window.addEventListener('click', function(){
	$("[data-toggle='popover']").popover('hide');
});

window.addEventListener('load', function(){
	var check = document.getElementById('inputCheck');
	var form = document.getElementById('postModal');
	var returnForm = document.getElementById('returnTripForm');

	check.addEventListener('click', function(){
		if(check.checked){
			returnForm.className = 'modal-header';
		}
		else{
			returnForm.className = 'modal-header hidden';
		}
	});

	var dest = document.getElementById('inputDest');
	var start = document.getElementById('inputStart');
	var headerDest = document.getElementById('headerDest');
	var headerStart = document.getElementById('headerStart');
	var headerDest2 = document.getElementById('headerDest2');
	var headerStart2 = document.getElementById('headerStart2');
	var inputArrive = document.getElementById('inputArrive');
	var inputLeave = document.getElementById('inputLeave');
	var previousDate = inputLeave.value;

	dest.addEventListener('input', function(){
		headerDest.innerHTML = dest.value;
		headerStart2.innerHTML = headerDest.innerHTML;
		if(headerDest.innerHTML == ""){
			headerDest.innerHTML = "Destination";
			headerStart2.innerHTML = "Start";
		}
	})

	start.addEventListener('input', function(){
		headerStart.innerHTML = start.value;
		headerDest2.innerHTML = headerStart.innerHTML;
		if(headerStart.innerHTML == ""){
			headerStart.innerHTML = "Start";
			headerDest2.innerHTML = "Destination";
		}
	})

	var postButton = document.getElementById('postRideButton');
	postButton.addEventListener('click', function(e){
		e.stopPropagation();
		var dest = document.getElementById('inputDest').value;
		var start = document.getElementById('inputStart').value;
		var seats = parseInt(document.getElementById('inputSeats').value);
		var leaveDay = document.getElementById('inputLeave').value;
		var leaveTime = document.getElementById('inputLeaveTime').value;
		var arriveDay = document.getElementById('inputArrive').value;
		var askPrice = document.getElementById('askPrice').value;
		var arriveTime = document.getElementById('inputArriveTime').value;
		var leavingTime = toEpoch(leaveDay, leaveTime);
		var arrivingTime = toEpoch(arriveDay, arriveTime);
		var isReturn = document.getElementById('inputCheck').checked; // Is there a return trip being added by the user?
		var validInputs = true; // Stays true as long as all inputs are valid.

		/*Perform input validation.*/
		if(!start){
			$('#inputStart').popover('show');
			validInputs = false;
		}
		if(!dest){
			$('#inputDest').popover('show');
			validInputs = false;
		}
		if(!askPrice){
			$('#askPrice').popover('show');
			validInputs = false;
		}
		if(!seats){
			$('#inputSeats').popover('show');
			validInputs = false;
		}
		if(!leaveDay){
			$('#inputLeave').popover('show');
			validInputs = false;
		}
		if(!leaveTime){
			$('#inputLeaveTime').popover('show');
			validInputs = false;
		}
		if(!arriveDay){
			$('#inputArrive').popover('show');
			validInputs = false;
		}
		if(!arriveTime){
			$('#inputArriveTime').popover('show');
			validInputs = false;
		}
		if(leavingTime > arrivingTime){ // If user tries to arrive before he/she leaves.
			$('#invalidArrival').popover('show');
			validInputs = false;
		}
		if(isReturn){
			var seatsReturn = parseInt(document.getElementById('inputSeatsReturn').value);
			var leaveDayReturn = document.getElementById('inputLeaveReturn').value;
			var leaveTimeReturn = document.getElementById('inputLeaveTimeReturn').value;
			var arriveDayReturn = document.getElementById('inputArriveReturn').value;
			var returnPrice = document.getElementById('returnPrice').value;
			var arriveTimeReturn = document.getElementById('inputArriveTimeReturn').value;

			var leavingTimeReturn = toEpoch(leaveDayReturn, leaveTimeReturn);
			var arrivingTimeReturn = toEpoch(arriveDayReturn, arriveTimeReturn);

			if(!seatsReturn){
				$('#inputSeatsReturn').popover('show');
				validInputs = false;
			}
			if(!leaveDayReturn){
				$('#inputLeaveReturn').popover('show');
				validInputs = false;
			}
			if(!leaveTimeReturn){
				$('#inputLeaveTimeReturn').popover('show');
				validInputs = false;
			}
			if(!arriveDayReturn){
				$('#inputArriveReturn').popover('show');
				validInputs = false;
			}
			if(!arriveTimeReturn){
				$('#inputArriveTimeReturn').popover('show');
				validInputs = false;
			}
			if(!returnPrice){
				$('#returnPrice').popover('show');
				validInputs = false;
			}
			if(leavingTimeReturn > arrivingTimeReturn){ // If user tries to arrive before he/she leaves.
				$('#invalidReturnArrival').popover('show');
				validInputs = false;
			}
			if(leavingTimeReturn < arrivingTime){ // If user tries to return before he/she arrives.
				$('#invalidReturnDeparture').popover('show');
				validInputs = false;
			}
			if(validInputs){
				post_double_ride("mhoutti@middlebury.edu", start, dest, leavingTime, arrivingTime, seats, askPrice, leavingTimeReturn, arrivingTimeReturn, seatsReturn, returnPrice);

				$('.modal').modal('hide')
				window.location.reload();
			}
		}
		else if(validInputs){
			post_single_ride("mhoutti@middlebury.edu", start, dest, leavingTime, arrivingTime, seats, askPrice);
			$('.modal').modal('hide')
			window.location.reload();
		}
	});

});

var post_single_ride = function(driver, src, dst, depTime, arrTime, numSeats, askPrice){
  return new Promise(function(resolve, reject){
    //Handle the pedantic networking
    var request = new XMLHttpRequest();

    request.addEventListener("error", function(event) {
      reject(Error("Network error"));
    });
    //If
    data = {driver: driver,
			 src: src,
			 dst: dst,
			 depTime: depTime,
			 arrTime: arrTime,
			 numSeats: numSeats,
			 askPrice: askPrice};
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        if(!res){
          //console.log("Did not log in")
          //window.alert("Invalid Login")
          resolve(res);
          //Do something like display failed attempt on screen
          //Modal?
        }
        else{
          resolve(res);
        }
      }
    };
    request.open('POST', '/postRideSingle', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));

    //console.log('sent login request');
  });
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

var post_double_ride = function(driver, src, dst, depTime, arrTime, numSeats, askPrice, depTimeReturn, arrTimeReturn, numSeatsReturn, askReturn){

  return new Promise(function(resolve, reject){
    //Handle the pedantic networking
    var request = new XMLHttpRequest();

    request.addEventListener("error", function(event) {
      reject(Error("Network error"));
    });
    //If
    data = {driver: driver,
			src: src,
			dst: dst,
			depTime: depTime,
			arrTime: arrTime,
			numSeats: numSeats,
			depTimeReturn: depTimeReturn,
			arrTimeReturn: arrTimeReturn,
			numSeatsReturn: numSeatsReturn,
			askPrice: askPrice,
			askReturn:  askReturn
		};
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        if(!res){
          //console.log("Did not log in")
          //window.alert("Invalid Login")
          resolve(res);
          //Do something like display failed attempt on screen
          //Modal?
        }
        else{
          resolve(res);
        }
      }
    };

    request.open('POST', '/postRideDouble', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));

    //console.log('sent login request');
  });
};
