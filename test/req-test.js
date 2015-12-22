//Run tests
var Discord = require("discord.js");
var request = require("request");
var fs = require('fs');

//Spawn globally required classes
var bot = new Discord.Client();

//Finally, let the bot login.
bot.login(process.env.TestUser, process.env.TestPW, function(error, sentMsg) {
	if (error != null) console.log("Login Errors: " + error);
});