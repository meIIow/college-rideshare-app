window.onload =function(){

	// get url/unique id from data passed into page when rendered
	console.log(idData.id);
	var id = idData.id;

	// attach event listener to Reset Password button
	var resetPasswordButton = document.getElementById("resetPassword");

	resetPasswordButton.addEventListener('click', function(){
		
		// retrieve new password and verification from text fields
		var newPassword = document.getElementById("newPassword").value;
		var verifyNewPassword = document.getElementById("verifyNewPassword").value;

		if (newPassword !== verifyNewPassword){
			$('#verifyNewPassword').popover('show');
		}
		else{
			$('#verifyNewPassword').popover('hide');
		}

		forgot_password_reset(id, newPassword).then(function(result){
			alert("Password reset! You will be redirected to the login page.");
			window.location.href = "/";
			
		});
	});



};


// send request to server to send email to the inputted email
var forgot_password_reset = function(id, newPassword){
	return new Promise(function(resolve, reject){
	    //Handle the pedantic networking
	    var request = new XMLHttpRequest();

	    request.addEventListener("error", function(event) {
	      reject(Error("Network error"));
	    });

	     request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        //console.log("request ready");
        var res = request.responseText;
        //console.log("request.responseText: " + res);
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
      else{
        //console.log("request not ready");
      }
    };

	    data = {id: id, newPassword: newPassword};

	    request.open('POST', '/forgot_password_reset', true);
	    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	    request.send(JSON.stringify(data));

	});
};