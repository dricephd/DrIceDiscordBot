/*
	File provides current status of a user's cooldown.
	Currently limited to commands only.
*/
//Required Modules
var Discord = require("discord.js");

//Module Variables
var bot;//Holds our discord bot so we can pass it
var COOLDOWN_TIME; //Cooldown time in seconds
var Users = {}; //Hold our user timeouts
/* 
	Users
		lastTimeStamp
		lastNotification
*/

//Setup our object
function Setup(botObject, cooldownSeconds,serverUsers) {
	
	//Initialize Array of Users and set timestamps to 0
	for (var i in serverUsers) {
		if (serverUsers[i].id) {
			Users[serverUsers[i].id]= {
				"lastTimeStamp" : "0",
				"lastNotification" : "0"
			};
		}
	}
	COOLDOWN_TIME = cooldownSeconds;
	bot=botObject;
}

//Updates a user's last command use time
function updateTimeStamp(msg) {
	Users[msg.author.id]["lastTimeStamp"] = msg.timestamp;
}


//	Takes a msg object from discord.js and returns true if user is on cooldown
function checkCooldown(msg) {
	var timeStamp = msg.timestamp;
	var usr = msg.author.id;
	
	bot.sendMessage(msg.channel,"test");
		
	//If there's no timestamp assume he can do it
	if (Users[usr]["lastTimeStamp"] <= 0 || Users[usr]["lastTimeStamp"] == undefined) {
		updateTimeStamp(msg);
		return false;
	}
	
	//If TimeStamp difference is less than the configuration
	if ((timeStamp - Users[usr]["lastTimeStamp"]) <= (COOLDOWN_TIME*1000)) {
		//Too Soon!
		return true;
	}
	
	//If TimeStamp difference is less than the configuration
	if ((timeStamp - Users[usr]["lastTimeStamp"]) >= (COOLDOWN_TIME*1000)) {
		//We've waited
		return false
	}
	
	//If we somehow miss all of it
	return false;
	
}

function sendReminder(msg) {
	
}
module.exports = {checkCooldown,Setup,updateTimeStamp};