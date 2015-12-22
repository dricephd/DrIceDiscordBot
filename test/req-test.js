//Run tests
var Discord = require("discord.js");
var request = require("request");
var fs = require('fs');

var bot = new Discord.Client();


//when the bot is ready
bot.on("ready", function () {
	console.log("Bot Reported as ready");
	
	exit();
});

//Login the bot
bot.login(process.env.TestUser, process.env.TestPW, function(error, token) {
	if (!token || token.length < 1) {
		console.log("Bad token.");
		return;
	}
	console.log("Bot Has Logged In Successfully");
});

//Run some tests
//???

//Logout the bot
function exit() {
	bot.logout();
	console.log("Tests completed.");
}
