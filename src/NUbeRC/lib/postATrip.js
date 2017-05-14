module.exports = function(db){

var makeDriverRide = function(driver, src, dst, depTime, arrTime, numSeats, trip){
	var users = db.get("usercollection");
	var docId;
	console.log("hello joey");
	users.insert({type: "ride", potential_drivers: [], driver: driver, potential_riders: [], riders: [], source: src, destination: dst, departure_time: depTime, arrival_time: arrTime, number_of_seats: numSeats}).then(function(insertedDoc){
		trip.confirmedRides.push(insertedDoc._id);
	});

};

/*
var makeRiderRide = function(rider, src, dst, depTime, arrTime, numSeats, tripId){
	var users = db.get("usercollection");
	var docId;
	return users.insert({type: "ride", potential_drivers: [], driver: "unknown", potential_riders: [], riders: [rider], source: src, destination: dst, departure_time: depTime, arrival_time: arrTime, number_of_seats: numSeats}).then(function(insertedDoc){
		users.update({_id:insertedDoc._id},{$push:{rides:rideId}});
		docId = insertedDoc._id;}).then(function(){return docId;})
};
*/

var makeTrip = function(owner){
	var users = db.get("usercollection");
	var docId;
	var insertedDoc = {potentialRides:[], confirmedRides :[]};
	console.log("yo");
	users.update({email: owner}, {$push:{trips: insertedDoc}});
	};

return {makeDriverRide: makeDriverRide, makeTrip:makeTrip};
};
