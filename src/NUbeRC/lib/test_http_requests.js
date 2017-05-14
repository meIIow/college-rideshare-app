
var DELETE_DATABASE = function(){
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState == 4 && request.status == 200) {
        var res = JSON.parse(request.responseText);
        resolve(res);
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
  request.open('GET', '/ERASE_DB', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send();
  });
};

var verification_request = function(id){
  return new Promise(function(resolve, reject){

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      //
      if (request.readyState == 4 && request.status == 200) {
        //console.log(request.responseText);
        //var res = JSON.parse(request.responseText);

        resolve(request.responseText);

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
  request.open('GET', '/verify?id='+id, true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send();
  });
};
var forceLogout = function(){
  return new Promise(function(resolve, reject){

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      //
      if (request.readyState == 4 && request.status == 200) {

        resolve(request.responseText);
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
  request.open('GET', '/logout', true);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send();
  });
};
