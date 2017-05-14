/*
This file should be used for the main handling of DOM changes and populating
The main bids page. IT SHOULD BE FRONT END ONLY.

Function list and explanations:
  getBids - Should populate the DOM with the relevant bids


*/

window.onload = function(){

document.getElementById('login').addEventListener("click", function(){
  var email = document.getElementById('inputEmail').value;
  var password = document.getElementById('inputPassword').value;
  request_login(email, password).then(function(result){
    console.log('request login client side');
    if(result){
      console.log('this should redirect');
      window.location.href = "/rides";
    }
    else{
      alert("We don't have a record of a valid account with that username and password.");
    }
  });
});


/*
This can be added back in to make check emails to ensure that they end in .edu and to check if passwords are 8 charecters or longer
if this is added back in the signup event listener below must be removed

var emailChecker = function(){
  console.log('inevent')
  var email = document.getElementById('inputEmail').value;
  if(email.slice(-4) !== '.edu'){
    $('#inputEmail').popover('show');
  }else{
    $('#inputEmail').popover('hide');
  }
}

var passwordChecker = function(){
  var password = document.getElementById('inputPassword').value;
  if(password.length <8){
    $('#inputPassword').popover('show');
  }else{
    $('#inputPassword').popover('hide');
  }
}

document.getElementById('inputEmail').addEventListener('change',emailChecker);
document.getElementById('inputEmail').addEventListener('keyup',emailChecker);
document.getElementById('inputPassword').addEventListener('change',passwordChecker);
document.getElementById('inputPassword').addEventListener('keyup',passwordChecker);
*/


document.getElementById("signup").addEventListener("click", function(){
  var email = document.getElementById('inputEmail').value;
  var password = document.getElementById('inputPassword').value;
  var username = email;

  // display appropriate alert on page for success/failure of account creation
  send_user_data(username,email,password).then(function(result){ 
    if (result[0] === 'u'){
      alert("An account with that username already exists!");
    }

    else if (result[0] === 'f'){
      alert("We've encountered an error in creating your account, please try again!");
    }

    else{
      alert("Account created! Account verification instructions can be found in the email you've provided.");
    }

  });
/*
  JACK'S CHECK EDU CODE
  if(email.slice(-4) !== '.edu' || password.length <8){
    alert("OBEY THE POPOVERS.\n--message brought to you by your friends at Big Brother");
  }else{
    send_user_data(username,email,password);
  }
  */
  //send_user_data(username,email,password);
  // var form = document.getElementById('loginform');
  // var username = document.createElement('div.input');
  // form.appendChild(username);
});


$('#loginform').submit(function(event){
  // prevent default browser behaviour
  event.preventDefault();
  var email = document.getElementById('inputEmail').value;
  var password = document.getElementById('inputPassword').value;
  request_login(email, password);

});

};


var send_user_data = function(username,mail,password){
  /*
  this is used for sending information for creating a user account
  Username, Mail, Password ALL strings
  */
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        //console.log(res);
        if(!res){
          resolve(res);
          console.log("new account creation failed")
        }
        else{
          resolve(res);
          //console.log("account created successfully, go check email")
        }
      }
    };
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
  data = {user: username, pass: password, email: mail};


  request.open('POST', '/create_account', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  /*
  *******************************************************
  */
    //console.log('sent');

  });
};


var request_login = function(email,password){
  return new Promise(function(resolve, reject){
    //Handle the pedantic networking
    var request = new XMLHttpRequest();

    request.addEventListener("error", function(event) {
      reject(Error("Network error"));
    });
    //If
    data = {password: password, email: email};
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


    request.open('POST', '/request_login', true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify(data));

    //console.log('sent login request');
  });
};

var createUser = function(email, password, username){
  return {
    email: email,
    password: password,
    username: username,
    riderRating: {
      rating1: 0,
      rating2: 0,
      cancellations: "0/0"
    },
    currentTrips: [],
    previousTrips: [],
    messages: {},
    driverRatings: {
      rating1: "",
      rating2: ""
    }
  };
};


//////////////////////////////
