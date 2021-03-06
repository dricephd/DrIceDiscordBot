//Run tests
var Discord = require("discord.js");
var fs = require('fs');
var Moment = require('moment');
var sqlite3 = require('sqlite3').verbose();

var bot = new Discord.Client();
//Hold our test Server/Channel Objects
var testServer;
var testTextChannel;
var testVoiceChannel;
var testMessage; //For functions where we need to pass messages.

console.logCopy = console.log.bind(console);
console.log = function(data) {
	var timestamp = '[' + Moment().format("HH:mm:ss") + '] ';
    this.logCopy(timestamp, data);
};

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
			bot.sendMessage(testTextChannel, "Test Message", function (error, message) {
				testMessage = message;
				success("Test Server Generation");
				testBotModules();
			});
		});
		
	});
}

function testBotModules()
{
	//ShitPost Test
	try {
		var ShitPost = require("../lib/shitpost.js");
		
		ShitPost.fetchShitPost(function (error,data) {
			if (error == null) {
				messageResponse=data;
				bot.sendMessage(testTextChannel,data);
			}
		});
	}
	catch (error) {
		failure("ShitPost: Module failed. " + error);
		deleteServer();
		throw error;
	}
	success("ShitPost");
	
	//Cooldown Test
	try {
		var Cooldown = require("../lib/cooldown.js");
		Cooldown.Setup(bot, 10, bot.users);
		Cooldown.updateTimeStamp(testMessage);
		bot.sendMessage(testMessage.channel, Cooldown.checkCooldown(testMessage));
		
	}
	catch (error) {
		failure("Cooldown: Module failed. " + error);
		deleteServer();
		throw error;
	}
	success("Cooldown");
	
	//PingPong Custom Commands Test
	try {
		PingPong = require("../lib/pingpong.js");
		PingPong.initializeDB();
		PingPong.insertCommand("!test","test",function(){});
		PingPong.deleteCommand("!test",function(){});
		var test = PingPong.getCommands();
		PingPong.closeDb();
	}
	catch (error) {
		failure ("PingPong: Module failed. " + error);
		deleteServer();
		throw error;
	}
	success("PingPong");
	
	
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
