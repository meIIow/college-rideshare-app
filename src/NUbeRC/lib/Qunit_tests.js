QUnit.reorder = false;


QUnit.module("Account creation", {
beforeEach: function(){
  DELETE_DATABASE();
},afterEach: function(){
}
});
//Test async tests

QUnit.test( "assert.async() test", function( assert ) {
  var done = assert.async();
  var input = $( "#test-input" ).focus();
  setTimeout(function() {
    assert.equal( true, true, "Input was focused, clear to run other tests" );
    done();
  },100);
});

QUnit.test( "Clear the test DB to start", function( assert ) {
  assert.expect( 2 ); // number of assert tests
  var done = assert.async(2);//number of 'dones' ---- use these for async calls
  //var done2 = assert.async();
  setTimeout(function() {
    DELETE_DATABASE().then(function(result){
      //assert.ok(result,"Deleting everything from the DB was a success");
      //console.log(result);
      assert.ok( result, "was able to delete all entries in DB.testcollection" );
      done();
    });
  }, 150 );
  setTimeout(function() {
    assert.ok( true, "If you're reading this, your DB is not running. Go Start MongoD" );
    done();
  }, 150);
});

QUnit.test("Add a user and try to login before and after verifying",function(assert){
  assert.expect(6);//Number of assertion tests
  var done = assert.async(4); //number of 'dones' -----use these for async calls
  setTimeout(function() {
    //First promise goes to the DB and tries to add a user (should always work, DB empty)
    send_user_data("testName1","nuberctesting@gmail.com",'password').then(function(user){
      assert.ok(user, "Trying to add a user to the DB" );
      done();
      //console.log(user);
      //Next assert checks to make sure user is not verified
      assert.notOk(user.verified, "Making sure user is not yet verified");

      //Attempt login to make sure user is not able to login if not verified

      assert.throws(request_login("nuberctesting@gmail.com",'password'),"assert throws");

        assert.ok(true, "Login before verification failed" );
        done();
        //Should expect an invalid response, user should not be able to login
        //now attempt to verify

        verification_request(user._id).then(function(verified){
          assert.ok(verified, "Attempting to verify" );
          done();

          request_login("nuberctesting@gmail.com",'password').then(function(validLogin){
            assert.ok(validLogin, "Login before verification" );
            done();
          });
        });




    });
  }, 150 );

});
//Assuming the above worked, make 2 functions to add a user and return the object
var add_users = function(){
  return new Promise(function(resolve, reject){
    var users = [];
    send_user_data("testName1","nuberctesting@gmail.com",'password').then(function(user){
    verification_request(user._id).then(function(verified){
      request_login("nuberctesting@gmail.com",'password').then(function(validLogin){
          users.push(validLogin);
          forceLogout().then(function(asd){
            send_user_data("testName2", "carpanion.ver@gmail.com",'password').then(function(user){
              verification_request(user._id).then(function(verified2){
                request_login("carpanion.ver@gmail.com",'password').then(function(validLogin2){
                  users.push(validLogin2);
                  forceLogout().then(function(){
                    resolve(validLogin2);
                  });
              });
            });
          });
        });
      });
    });
  });
});
}
var login = function(){
  return new Promise(function(resolve, reject){
    request_login("nuberctesting@gmail.com",'password').then(function(validLogin){
      resolve(validLogin);
    });
  });
}
var add_login = function(){
  return new Promise(function(resolve, reject){
    DELETE_DATABASE().then(function(){
      add_users().then(function(){
        login().then(function(soFar){
          resolve(soFar);
        });
      });
    });
  });
}


QUnit.module("Ride creation", {
beforeEach: function(){
},afterEach: function(){
}
});

QUnit.test( "Post a single Ride", function( assert ) {
  assert.expect(2);//Number of assertion tests
  var done = assert.async(1);//put the number of async calls here

  setTimeout(function() {
    add_login().then(function(){
      post_single_ride("nuberctesting@gmail.com","Middlebury",
            "Boston","01234566789","0987654321","2","Food"
          ).then(function(result){
              var rides=[];
              rides.push(result);
              assert.ok(result,"Test post ride single returns validly");
              assert.equal(result.driver,"nuberctesting@gmail.com",
            "This checks to make sure correct driver in ride");
            done();

      });
    });
  });
});

QUnit.test( "Post a double ride (return trip)", function( assert ) {
  assert.expect(3);//Number of assertion tests
  var done = assert.async(1);//put the number of async calls here
  setTimeout(function() {
    add_login().then(function(){
      post_double_ride("nuberctesting@gmail.com","Double",
            "Ride","01234566789","0987654321","2","Food","01234566789",
            "012345667890","3","more food"
            ).then(function(result){
              var rides = [];
              rides.push(result[0]);
              rides.push(result[1]);
              assert.ok(result,"Test post ride single returns validly");

              assert.equal(result[0].driver,"nuberctesting@gmail.com",
              "This checks to make sure correct driver in first ride");

              assert.equal(result[1].driver,"nuberctesting@gmail.com",
              "This checks to make sure correct driver in return ride");
              done();
      });
    });
  });
});
//can make a function for posting rides from This
var postDouble = function(assert,done){
  return new Promise(function(resolve,reject){
      add_login().then(function(){
        post_double_ride("nuberctesting@gmail.com","Double",
              "Ride","01234566789","0987654321","2","Food","01234566789",
              "012345667890","3","more food"
              ).then(function(result){
                var rides =[];
                rides.push(result[0]);
                rides.push(result[1]);
                assert.ok(result,"Test post ride single returns validly");

                assert.equal(result[0].driver,"nuberctesting@gmail.com",
                "This checks to make sure correct driver in first ride");

                assert.equal(result[1].driver,"nuberctesting@gmail.com",
                "This checks to make sure correct driver in return ride");
                done();

                resolve(rides);
        });
      });
  });
};

QUnit.module("Finding rides", {
beforeEach: function(){
  var rides = [];
},afterEach: function(){
}
});

QUnit.test( "sign in as user 2 and find rides", function( assert ) {
  assert.expect(10);//Number of assertion tests
  var done = assert.async(7);//put the number of async calls here
  setTimeout(function() {
    postDouble(assert,done).then(function(twoRides){
      rides.push(twoRides[0]);
      rides.push(twoRides[1]);
      //up to here, we know that the rides are valid and match, now, sign out
      //then back in as other user
      done();
      forceLogout().then(function(ret){
        //now sign out as carpanion, sign in as nuberc testin

        request_login("carpanion.ver@gmail.com",'password').then(function(validLogin){
          assert.ok(validLogin, "Login as carpanion " );
          done();
          /////HERE, we are signed in as nuberctesting and want to look for the
          //rides just posted by the other account
          getRides().then(function(allrides){
            assert.equal(allrides.length, 2, "Checking to see that 2 rides are found");
            assert.equal(allrides[0].source, "Double", "Checking the source of the first ride");
            assert.equal(allrides[1].source, allrides[0].destination,
              "Checking the source of the second ride is the dest of the second");
            done();
            //departTime, arriveTime, start, destination, seats_avail
            getRides(false, false, "Double" , "", false).then(function(secondQ){
              assert.equal(secondQ.length, 1, "making sure only 1 result from our search");
              done();
              getRides(false, false, "ide" , "", false).then(function(secondQ){
                assert.equal(secondQ.length, 1, "checking that the REGEX search works");
                assert.equal(secondQ[0].source, "Ride", "REGEX search, source verification");
                done();
                forceLogout().then(function(){
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});


QUnit.module("Edit Profile", {
beforeEach: function(){
},afterEach: function(){
}
});

QUnit.test( "change username and phone number", function( assert ) {
  assert.expect(4);//Number of assertion tests
  var done = assert.async(3);//put the number of async calls here

  setTimeout(function() {
    //currently signed in  as nuberc testing and we will change the username and phone
    add_login().then(function(validLogin){
      assert.ok(validLogin, "Login as nuberc " );
      done();
      edit_profile("NewUSERNAME", "1111111111").then(function(result){
            result = JSON.parse(result);
            console.log(result);

            assert.ok(result,"edit profile returns a truthy value");
            assert.equal(result.username,"NewUSERNAME",
              "checking new username");
            assert.equal(result.phoneNumber,"1111111111",
              "checking new phone number");
          done();
          forceLogout().then(function(){
            done();
          })
      });
    });
  });
});


QUnit.module("Change Password", {
beforeEach: function(){
},afterEach: function(){
}
});

QUnit.test( "Login and change password, then sign in with new password", function( assert ) {
  assert.expect(4);//Number of assertion tests
  var done = assert.async(5);//put the number of async calls here

  setTimeout(function() {
    //currently signed in  as nuberc testing and we will change the username and phone
    add_login().then(function(validLogin){
      console.log(validLogin)
      assert.ok(validLogin, "Login as nuberc " );
      done();
      change_password("password","NEWpassword").then(function(result){
          result = JSON.parse(result);
          assert.ok(result,"change password returns a truthy value");
          done();
          forceLogout().then(function(){
            request_login("nuberctesting@gmail.com",'password').then(function(failLogin){
              assert.notOk(failLogin,"Logining in with the old password ");
              done();
              request_login("nuberctesting@gmail.com",'NEWpassword').then(function(workLogin){
                assert.ok(workLogin,"Logining in with the new password ");
                done();
                forceLogout().then(function(){
                  done();
              });
            });
          });
        });
      });
    });
  });
});

QUnit.module("Bid on ride", {
beforeEach: function(){
},afterEach: function(){
}
});

QUnit.test( "Login and bid on someone elses ride", function( assert ) {
  assert.expect(5);//Number of assertion tests
  var done = assert.async(5);//put the number of async calls here

  setTimeout(function() {
    postDouble(assert,done).then(function(rides){
      done();

      forceLogout().then(function(){
        done();
        request_login("carpanion.ver@gmail.com",'password').then(function(login){
          assert.ok(login, "Checking to make sure login actually worked for carpanion")
          done();
          //Now need to bid on a ride present
          //console.log(rides[0]);
          bidOnRide(rides[0]["_id"] , 1, true, "newTrip").then(function(result){
            assert.ok(result,"checking to see that the trip was created successfully");
            done();
          });
        });

      });
    });
  });
});

QUnit.module("Accept a rider", {
beforeEach: function(){
},afterEach: function(){
}
});

QUnit.test( "Login and accept a rider who has bid on your ride", function( assert ) {
  assert.expect(7);//Number of assertion tests
  var done = assert.async(8);//put the number of async calls here

  setTimeout(function() {
    postDouble(assert,done).then(function(rides){
      done();

      forceLogout().then(function(){
        done();
        request_login("carpanion.ver@gmail.com",'password').then(function(login){
          assert.ok(login, "Checking to make sure login actually worked for carpanion")
          done();
          //Now need to bid on a ride present
          //console.log(rides[0]);
          bidOnRide(rides[0]["_id"] , 1, true, "newTrip").then(function(result){
            assert.ok(result,"checking to see that the trip was created successfully");
            done();
            forceLogout().then(function(){
              done();
              request_login("nuberctesting@gmail.com",'password').then(function(login2){
                assert.ok(login2,"The second login worked");
                done();
                acceptRider("carpanion.ver@gmail.com",rides[0]["_id"].toString()).then(function(accepted){
                  assert.ok(login2,"accepted the rider ");
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});

QUnit.module("Cancel a drive", {
beforeEach: function(){
},afterEach: function(){
}
});

QUnit.test( "Cancel a drive that you posted", function( assert ) {
  assert.expect(8);//Number of assertion tests
  var done = assert.async(4);//put the number of async calls here

  setTimeout(function() {
    //currently signed in  as nuberc testing and we will change the username and phone
    postDouble(assert,done).then(function(rides){
      done();
      assert.equal(rides.length,2,"checking to make sure 2 rides exist");
      getRides(false, false, "" , "", false).then(function(found){
        assert.equal(found.length,2,"checking to make sure 2 rides are found")
        done();
        console.log(rides[0]["_id"]);
        cancelDrive("nuberctesting@gmail.com",rides[0]["_id"]).then(function(worked){
          assert.ok(worked,"Server returns validly");
          done();
          getRides().then(function(found2){
            assert.equal(found2.length,1,"checking to make sure only 1 ride is found")
            done();
          });
        });
      });
    });
  });
});
