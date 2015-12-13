/*
	This is DrIceBot, mostly a ping-pong bot that responds to commands.
	Currently it is best configured when only running on one server due to the way config.json is utilized.
	VERSION: 0.2.0
*/

const VERSION = "0.2.0";

//Load Dependencies
var Discord = require("discord.js");

// Load JSON Files
var AuthDetails = require("./auth.json");
var ConfigDetails = require("./config.json");

var bot = new Discord.Client();

//when the bot is ready
bot.on("ready", function () {
	console.log("Running Version " + VERSION);
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

//when the bot disconnects
bot.on("disconnected", function () {
	//alert the console
	console.log("Disconnected!");

	//exit node.js with an error
	process.exit(1);
});

//when the bot receives a message
bot.on("message", function (msg) {
	/* Commands for primary use
		* !help
		* !fish
	*/
	//Sends PM to user of all relevant commands
	if (msg.content === "!help") {
		//DM The commands to the caller
		bot.sendMessage(msg.sender, "**__Commands for DIDBC bot__**");
		bot.sendMessage(msg.sender, "!help - You're already doing it!");
		bot.sendMessage(msg.sender, "!fish - Slaps requester about with a trout!");
		bot.sendMessage(msg.sender, "!ID - PM the Channel and User ID to caller and print them both in the log.");
		bot.sendMessage(msg.sender, "!configtest - Test the settings in config.json [Requires manageRolls and manageChannels Permissions]");
		
	}
	
	//Stupid joke command
	if (msg.content === "!fish") {
		bot.sendMessage(msg.channel, "***Slaps " + msg.author + " about with a smelly trout.***");
	}
	
	/* Commands that are mainly for debugging purposes:
		* Ping
		* !ID
		
		Manage Roles and Manage Channels permissions required to run:
		* !ConfigTest
	*/
		
	//if message is "!ID"
	if (msg.content === "!ID") {
		//Respond and log Channel ID, User ID
		bot.sendMessage(msg.sender, "Channel ID: " + msg.channel);
		bot.sendMessage(msg.sender, "User ID: " + msg.author);
		console.log("User Requested ID's through !ID command:");
		console.log("Channel ID: " + msg.channel);
		console.log("User ID: " + msg.author);
	}
	
	//if message is !ConfigTest, test variables in config.json and report errors.
	if (msg.content === "!configtest") {
		//Grab the permissions of the person who called the command so we can verify
		var permissions = msg.channel.permissionsOf(msg.sender);
		
		/*Verify Permissions:
			* manageRolls
			* manageChannels
			
			Otherwise refuse to run.
		*/
		console.log(permissions);
		if (permissions.hasPermission("manageRoles") && permissions.hasPermission("manageChannels")) {
			//Run Config Tests
			bot.reply(msg, "``Running Config.json Test``");
			bot.sendMessage(msg.channel, "``Sending Test Message to Config.json statusLogChannel...``");
			bot.sendMessage(ConfigDetails.statusLogChannel, "Configuration Test for Log Channel " + "<#" + ConfigDetails.statusLogChannel + ">", function(error, sentMsg) {
				console.log("ConfigTest log Channel: " + ConfigDetails.statusLogChannel);
				console.log("Erorr listing: " + error);
			});
		}
	}
	
});

//when the bot receives user status update
bot.on("presence", function (usr, status, gID) {
	//If the user status is online
	if (status === "online") {
		//If they are online and status is null, this is called when quitting a game too but that's acceptable for me.
		if (gID === null) {
			//send to the User Log Channel
			bot.sendMessage(ConfigDetails.statusLogChannel, "✅" + usr.username + " is now " + status, function(error, sentMsg) {
				console.log(ConfigDetails.statusLogChannel + error);
			});
		}
		
	} else if (status === "offline") {
		//Send to the User Log Channel that he's offline
		bot.sendMessage(ConfigDetails.statusLogChannel, "❌" + usr.username + " is now " + status);
	} else if (status === "idle") {
		//Send to the User Log Channel that he's idle
		bot.sendMessage(ConfigDetails.statusLogChannel, "🕓" + usr.username + " is now " + status);
	} else {
		console.Log("Status Update: Error");
	}
});

//Overload Function
console.logCopy = console.log.bind(console);
console.log = function(data)
{
	var timestamp = '[' + Date.now() + '] ';
    this.logCopy(timestamp, data);
};

//Finally, let the bot login.
bot.login(AuthDetails.email, AuthDetails.password, function(error, sentMsg) {
	console.log("Login Errors: " + error);
});