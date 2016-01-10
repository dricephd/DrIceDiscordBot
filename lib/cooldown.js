/*
	File provides current status of a user's cooldown.
	Currently limited to commands only.
*/
var COOLDOWN_TIME; //Cooldown time in seconds
var Users = {}; //Hold our user timeouts

//Setup our object
function Setup(cooldownSeconds,serverUsers) {
	
	//Initialize Array of Users and set timestamps to 0
	for (var i in serverUsers) {
		if (serverUsers[i].id) {
			Users[serverUsers[i].id]=0;
		}
	}
	COOLDOWN_TIME = cooldownSeconds;
}

//Updates a user's last command use time
function updateTimeStamp(msg) {
	Users[msg.author.id] = msg.timestamp;
}


//	Takes a msg object from discord.js and returns true if user is on cooldown
function checkCooldown(msg) {
	var timeStamp = msg.timestamp;
	var usr = msg.author.id;
		
	//If there's no timestamp assume he can do it
	if (Users[usr] <= 0 || Users[usr] == undefined) {
		updateTimeStamp(msg);
		return false;
	}
	
	//If TimeStamp difference is less than the configuration
	if ((timeStamp - Users[usr]) <= (COOLDOWN_TIME*1000)) {
		//Too Soon!
		return true;
	}
	
	//If TimeStamp difference is less than the configuration
	if ((timeStamp - Users[usr]) >= (COOLDOWN_TIME*1000)) {
		//We've waited
		return false
	}
	
	//If we somehow miss all of it
	return false;
	
}
module.exports = {checkCooldown,Setup,updateTimeStamp};