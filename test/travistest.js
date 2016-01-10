//Run tests
var Discord = require("discord.js");
var fs = require('fs');

var bot = new Discord.Client();
//Hold our test Server/Channel Objects
var testServer;
var testTextChannel;
var testVoiceChannel;

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

//when the bot is ready
bot.on("ready", function () {
	success("Bot Login");
	createTestServer();
});

//Generate a server so we can run better tests
function createTestServer(){
	bot.createServer(process.env.TestUser, "us-east", function(error,server) {
		if (error){
			failure("Test Server Generation");
			exit();
			throw error;
		}
		testServer=server;
		testTextChannel=server.defaultChannel;
		//This should return error first for async callback but it only returns channel? Doc wrong?
		bot.createChannel(testServer, "Test Voice", "voice", function(channel) {
			testVoiceChannel=channel;
			success("Test Server Generation");
			testBotModules();
		});
		
	});
}

function testBotModules()
{
	//ShitPost Test
	try {
		var ShitPost = require("../lib/shitpost.js");
		//bot.sendMessage(testTextChannel,ShitPost.fetchShitPost());
		
		ShitPost.fetchShitPost(function (error,data) {
			if (error == null) {
				messageResponse=data;
				bot.sendMessage(testTextChannel,data);
			}
		});
	}
	catch (error) {
		failure("ShitPost: Module failed to load.");
		deleteServer();
		throw error;
	}
	success("ShitPost");
	
	
	//Exit
	success("Modules Loaded.")
	deleteServer();
	
}

function deleteServer() {
	bot.leaveServer(testServer, function(error) {
		exit();
	});
}
//Logout the bot
function exit() {
	bot.logout();
	console.log("Tests completed.");
	process.exit(0);
}
