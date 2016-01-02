/*
	File provides current status of a user's cooldown.
	Currently limited to commands only.
*/


//Setup our object
function Setup(cooldownSeconds) {
	
}

//Updates a user's last command use time
function updateTimeStamp(msg) {
	
}


//	Takes a msg object from discord.js and returns true if user is on cooldown
function checkCooldown(msg) {
	console.log(msg.timestamp);
	return true;
}
module.exports = {checkCooldown,Setup,updateTimeStamp};