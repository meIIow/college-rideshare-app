window.onload =function(){

	// attach to send email button event listener
	var enterEmailButton = document.getElementById("enterEmail");

	enterEmailButton.addEventListener('click', function(){

		// retrieve email from text field
		var email = document.getElementById('inputEmail').value;

		// send request to server with email
		forgot_password_email(email).then(function(result){
			if (result[0] === 't'){
				alert('Instructions for resetting your password have been sent to your email.');
			}

			else {
				alert('No verified account linked with this email.');
			}
		})

	});



};


// send request to server to send email to the inputted email
var forgot_password_email = function(email){
	return new Promise(function(resolve, reject){
	    //Handle the pedantic networking
	    var request = new XMLHttpRequest();

	    request.addEventListener("error", function(event) {
	      reject(Error("Network error"));
	    });

	    request.onreadystatechange = function() {
	      if (request.readyState == 4 && request.status == 200) {

	        var res = request.responseText;

	        if(!res){
	          resolve(res);
	        }
	        else{
	          resolve(res);
	        }
	      }
	    };

	    data = {email: email};

	    request.open('POST', '/forgot_password_email', true);
	    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	    request.send(JSON.stringify(data));

	});
};