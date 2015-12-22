//Run tests
var Discord = require("discord.js");
var request = require("request");
var fs = require('fs');

var bot = new Discord.Client();


//when the bot is ready
bot.on("ready", function () {
	console.log("Bot Reported as ready");
});

//Login the bot
bot.login(process.env.TestUser, process.env.TestPW, function(error, sentMsg) {
	if (error != null) return console.log("Login Errors: " + error);
	console.log("Bot Has Logged In Successfully");
});

//Run some tests
//???

//Logout the bot
bot.logout(function(error) {
	if (error) return console.log("Logout Errors: " + error);
});