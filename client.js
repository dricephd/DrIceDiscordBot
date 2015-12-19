/*
	This is DrIceBot, mostly a ping-pong bot that responds to commands.
	Currently it is best configured when only running on one server due to the way config.json is utilized.
	VERSION: 0.3.0
*/

const VERSION = "0.3.0";

//Load Dependencies
var Discord = require("discord.js");

// Load JSON Files
var AuthDetails = require("./config_files/auth.json");
var ConfigDetails = require("./config_files/config.json");

//Spawn globally required classes
var bot = new Discord.Client();
var fs = require('fs'); //Used for File Input Output

//Setup console log function
console.logCopy = console.log.bind(console);
console.log = function(data) {
	var timestamp = '[' + Date.now() + '] ';
    this.logCopy(timestamp, data);
};


//Send enabled help commands to requester
commandHelp = function(msg) {	
	//DM The commands to the caller
	bot.sendMessage(msg.sender, "**__Commands for DIDBC bot__**");
	bot.sendMessage(msg.sender, "!help - You're already doing it!");
	
	//If the function is enabled send the command
	if (ConfigDetails.featureStatus.fish === "1") bot.sendMessage(msg.sender, "!fish - Slaps requester about with a random fish!");
	if (ConfigDetails.featureStatus.roulette === "1") bot.sendMessage(msg.sender, "!roulette - Choose an active user in the channel at random.")
	if (ConfigDetails.featureStatus.ID === "1") bot.sendMessage(msg.sender, "!ID - PM the Channel and User ID to caller and print them both in the log.");
	if (ConfigDetails.featureStatus.configTest === "1") bot.sendMessage(msg.sender, "!configtest - Test the settings in config.json [Requires manageRolls and manageChannels Permissions]");
};

//Hits the user with a fish loaded randomly from our file
commandFish = function(msg) {
	//error handling for the fish file
	try {
		var fishList = fs.readFileSync("./dat_files/commonFishNames.txt").toString().split("\n");
		bot.sendMessage(msg.channel, "**Slaps " + msg.author + " about with a really smelly " + fishList[Math.floor(Math.random()*fishList.length)] + "**");
	}
	catch (error) {
		console.log(error);
		bot.sendMessage(msg.channel, "There was an error with this command's data file.");
	}
	
}

//Chooses a user at random
commandRoulette = function(msg) {
	//Select someone at random that isn't the bot
	var activeUsers = bot.users;
	var rouletteWinner = bot.user; //Set it to itself for next bit of logic
	
	//Make sure we don't chose someone who's offline, idle, or the bot
	while (rouletteWinner === bot.user || rouletteWinner.status == "offline" || rouletteWinner.status == "idle") {
		rouletteWinner = activeUsers[Math.floor(Math.random()*activeUsers.length)]; //Keep picking until bot doesn't win
	}
	
	bot.sendMessage(msg.channel, rouletteWinner + " has been selected at random by the powers that be.")
	console.log("Roulette Winner: " + rouletteWinner.username + " " + rouletteWinner.id);
}

//ID Values returned
commandID = function(msg) {
	//Respond and log Channel ID, User ID
	bot.sendMessage(msg.sender, "Channel ID: " + msg.channel);
	bot.sendMessage(msg.sender, "User ID: " + msg.author);
	console.log("User Requested ID's through !ID command:");
	console.log("Channel ID: " + msg.channel);
	console.log("User ID: " + msg.author);
}

//ConfigTest command
commandConfigTest = function(msg) {
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
		
		//Test status notifier
		bot.sendMessage(msg.channel, "``Sending Test Message to Config.json statusLogChannel...``");
		bot.sendMessage(ConfigDetails.statusLogChannel, "Configuration Test for Log Channel " + "<#" + ConfigDetails.statusLogChannel + ">", function(error, sentMsg) {
			console.log("ConfigTest log Channel: " + ConfigDetails.statusLogChannel);
			console.log("Erorr listing: " + error);
		});
	}
}


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
		* !roulette
	*/
	//Sends PM to user of all relevant commands
	if (msg.content === "!help" && ConfigDetails.featureStatus.help === "1") {
		commandHelp(msg);
	}
	
	//Stupid joke command
	if (msg.content === "!fish" && ConfigDetails.featureStatus.fish === "1") {
		commandFish(msg);
	}
	
	//Randomly choose a user
	if (msg.content === "!roulette" && ConfigDetails.featureStatus.roulette === "1") {
		commandRoulette(msg);
	}
	
	/* Commands that are mainly for debugging purposes:
		* !ID
		* !ConfigTest
	*/
		
	//if message is "!ID"
	if (msg.content === "!ID" && ConfigDetails.featureStatus.ID === "1") {
		commandID(msg);
	}
	
	//if message is !ConfigTest, test variables in config.json and report errors.
	if (msg.content === "!configtest" && ConfigDetails.featureStatus.configTest === "1") {
		commandConfigTest(msg);
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

//Finally, let the bot login.
bot.login(AuthDetails.email, AuthDetails.password, function(error, sentMsg) {
	if (error != null) console.log("Login Errors: " + error);
});
