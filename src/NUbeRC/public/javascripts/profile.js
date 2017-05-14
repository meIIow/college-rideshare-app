window.addEventListener('click', function(){
  $("[data-toggle='popover']").popover('hide');
})

window.onload =function(){
  var tab = document.getElementById("profile").className="active";

  console.log(JSON.stringify(userData));

  var rating1 = function(object){
  	if (object.cleanliness == ""){
  	  return "No rating yet";
  	}else{
  	  return object.cleanliness;
  	}
  };

  var rating2 = function(object){
  	if (object.punctuality == ""){
  	  return "No rating yet";
  	}else{
  	  return object.punctuality;
  	}
  };

  document.getElementById('panelTitle').innerHTML = userData.username;
  document.getElementById('profileName').innerHTML = userData.username;
  document.getElementById('profileEmail').innerHTML = userData.email;
  document.getElementById('profileRating1').innerHTML = rating1(userData.driverRatings);
  document.getElementById('profileRating2').innerHTML = rating2(userData.driverRatings);
  document.getElementById('profilePhone').innerHTML = "(" + userData.phone.substr(0, 3) + ") " + userData.phone.substr(3, 3) + "-" + userData.phone.substr(6, 4);
  document.getElementById('profilePicture').src = userData.picture;

  // set initial field values to user's current username/phonenumber
  var usernameField = document.getElementById('usernameField');
  usernameField.value = userData.username;

  // ensuring phone number valid
  var phoneNumberField1 = document.getElementById('phoneNumber1');
  var phoneNumberField2 = document.getElementById('phoneNumber2');
  var phoneNumberField3 = document.getElementById('phoneNumber3');

  if(userData.phone.length != 10){
    phoneNumberField1.value = "000";
    phoneNumberField2.value = "000";
    phoneNumberField3.value = "0000";
  }
  else{
    phoneNumberField1.value = userData.phone.substr(0, 3);
    phoneNumberField2.value = userData.phone.substr(3, 3);
    phoneNumberField3.value = userData.phone.substr(6, 4);
  }

  // when user clicks 'Submit Changes', update username and phone number
  var submitChangesButton = document.getElementById('changeUserInfo');

  submitChangesButton.addEventListener('click', function(e){
    e.stopPropagation();
    var validInputs = true; // Becomes false if any input is invalid.
    var newUsername = usernameField.value;
    var newPhoneNumber = phoneNumberField1.value + phoneNumberField2.value + phoneNumberField3.value;

    if(newUsername == ""){
      $('#usernameField').popover('show');
      validInputs = false;
    }

    if(newPhoneNumber.length != 10){
      $('#phoneNumber3').popover('show');
      validInputs = false;
    }

    // send request to server to update profile
    if(validInputs){
      edit_profile(newUsername, newPhoneNumber).then(function(result){
        window.location.reload();
      });
    }


  });

  // retrieve password information from page


  // when user clicks 'Change Password', update password if correct credentials entered
  var changePasswordButton = document.getElementById('changePasswordButton');

  changePasswordButton.addEventListener('click', function(){
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword = document.getElementById('newPassword').value;
    var verifyNewPassword = document.getElementById('verifyNewPassword').value;
    console.log("retrieving passwords: " + oldPassword + " " + newPassword + " " + verifyNewPassword);

    if (newPassword !== verifyNewPassword){
      alert("New password confirmation doesn't match new password.")
    }

    else{
      change_password(oldPassword, newPassword).then(function(result){
        //result is always returned as a string, so we check the first letter of it to see if it is true or false
        if(result[0] == "t"){
          alert('Password successfully changed - you will be asked to log in again!')
          window.location.href = "/logout";;
        }
        else{
          alert('Changing password failed. Please try again!');
        }
      });

    }


  });

  // function to send post request to back end for updating profile

  var uploadPictureButton = document.getElementById('uploadPictureButton');
  uploadPictureButton.addEventListener('click', function(){
    var newPicture = document.getElementById('newPicture').files[0];

      //newPicture.append('file',);

          console.log(newPicture);
          upload_picture(newPicture);
          //window.location.href = "/profile";;


    });


}

var edit_profile = function(username, phoneNumber){
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

    data = {username: username, phoneNumber: phoneNumber};

    request.open('POST', '/editProfile', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));

    //console.log('sent login request');
  });
};


var change_password = function(oldPassword, newPassword){
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

    data = {oldPassword: oldPassword, newPassword: newPassword};

    request.open('POST', '/changePassword', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));

    //console.log('sent login request');
  });
};


var upload_picture = function(image){
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

    request.open('POST', '/uploadPhoto', true);
    request.setRequestHeader("Content-Type", "image/*");

    request.send(JSON.stringify(image));

    //console.log('sent login request');
  });
};
