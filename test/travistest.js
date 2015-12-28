//Run tests
var Discord = require("discord.js");
var fs = require('fs');

var bot = new Discord.Client();

function success(msg) {
	console.log("✓ ... " + msg);
}

function failure(msg) {
	console.log("X ... " + msg);
}

//Login the bot
bot.login(process.env.TestUser, process.env.TestPW, function(error, token) {
	if (!token || token.length < 1) {
		failure("Bot Login: Bad Token Response");
		return;
	}
	if (error) {
		failure("Bot Login");
	}
});

//Run some tests
//???

//when the bot is ready
bot.on("ready", function () {
	success("Bot Login");
	
	testBotModules();
});

function testBotModules()
{
	//ShitPost Test
	try {
		var ShitPost = require("../lib/shitpost.js");
	}
	catch (error) {
		failure("ShitPost: Module failed to load.");
		throw error;
	}
	ShitPost.fetchShitPost(function (error,data){
		if (error == null) {
			success("ShitPost");
		}
		if (error) {
			failure("ShitPost");
			return;
		}
	});
	
	//Exit
	success("Modules Loaded.")
	exit();
	
}
//Logout the bot
function exit() {
	bot.logout();
	console.log("Tests completed.");
	process.exit(0);
}
