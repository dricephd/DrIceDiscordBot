/*
	This is DrIceBot, mostly a ping-pong bot that responds to commands.
	Currently it is best configured when only running on one server due to the way config.json is utilized.
	VERSION: DEV-0.5.0
*/

const VERSION = "DEV-0.5.0";

// Load JSON Files
var AuthDetails = require("./config/auth.json");
var ConfigDetails = require("./config/config.json");

// Set Feature Constants
const FEATURE_FISH = ConfigDetails.featureStatus.fish;
const FEATURE_ROULETTE = ConfigDetails.featureStatus.roulette;
const FEATURE_SHITPOST = ConfigDetails.featureStatus.shitpost;
const FEATURE_STATUSNOTIFY = ConfigDetails.featureStatus.statusNotifier;
const FEATURE_HELP = ConfigDetails.featureStatus.help;
const FEATURE_ID = ConfigDetails.featureStatus.ID;
const FEATURE_CONFIGTEST = ConfigDetails.featureStatus.configTest;
const FEATURE_COOLDOWN = ConfigDetails.featureStatus.cooldown;

//Set Non-Feature Constants
const CONFIG_COOLDOWN = ConfigDetails.cooldownTime;

//Load Dependencies
var Discord = require("discord.js");
if (FEATURE_SHITPOST) var ShitPost = require("./lib/shitpost.js");
if (FEATURE_CONFIGTEST) var ConfigTest = require("./lib/configtest.js");
if (FEATURE_FISH) var fs = require('fs'); //Used for File Input Output
if (FEATURE_COOLDOWN) var Cooldown = require("./lib/cooldown.js");

//Spawn globally required classes
var bot = new Discord.Client();

//Setup console log function
console.logCopy = console.log.bind(console);
console.log = function(data) {
	var timestamp = '[' + Date.now() + '] ';
    this.logCopy(timestamp, data);
};

//Send enabled help commands to requester
commandHelp = function(msg) {
	//Buffer all of our response then send it so we don't get weird ordering
	var msgResponse="";
	//DM The commands to the caller
	msgResponse += "**__Commands for DIDBC bot Ver. " + VERSION + "__**\n";
	msgResponse += "!help - You're already doing it!\n";
	
	//If the function is enabled send the command
	if (FEATURE_FISH) msgResponse += "!fish - Slaps requester about with a random fish!\n";
	if (FEATURE_ROULETTE) msgResponse += "!roulette - Choose an active user in the channel at random.\n";
	if (FEATURE_SHITPOST) msgResponse += "!shitpost - Post a shitpost from one of several subreddits\n";
	if (FEATURE_ID) msgResponse += "!ID - PM the Channel and User ID to caller and print them both in the log.\n";
	if (FEATURE_CONFIGTEST) msgResponse += "!configtest - Test the settings in config.json\n";
	bot.sendMessage(msg.sender, msgResponse);
};

//Hits the user with a fish loaded randomly from our file
commandFish = function(msg) {
	//error handling for the fish file
	var fishList;
	fs.readFile("./dat/commonFishNames.txt",function (error,data) {
		if (error) {
			return console.log(error);
		}
		fishList=data.toString().split("\n");
		bot.sendMessage(msg.channel, "**Slaps " + msg.author + " about with a really smelly " + fishList[Math.floor(Math.random()*fishList.length)] + "**");
	});
}

//Chooses a user at random
commandRoulette = function(msg) {
	//Select someone at random that isn't the bot
	var activeUsers = bot.users;
	var rouletteWinner = bot.user; //Set it to itself for next bit of logic
	
	//Avoid infinite loop if bot is alone
	if (activeUsers.length <= 1) {
		bot.sendMessage(msg.channel, "You need more people to use this command.");
		return;
	}
	
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

/*
	Bot Events Handling
*/

//when the bot is ready
bot.on("ready", function () {
	//coodlown.js object setup
	if (FEATURE_COOLDOWN) Cooldown.Setup(bot,CONFIG_COOLDOWN, bot.users);
		
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
	var messageResponse="";
	/* Commands for primary use
		* !help
		* !fish
		* !roulette
		* !shitpost
	*/
	//If it detects its own message skip
	if (msg.author.id == bot.user.id) return;
	
	//Sends PM to user of all relevant commands
	if (msg.content === "!help" && FEATURE_HELP && !Cooldown.checkCooldown(msg)) {
		//Update last time we used a command
		Cooldown.updateTimeStamp(msg);
		commandHelp(msg);
	}
	
	//Stupid joke command
	if (msg.content === "!fish" && FEATURE_FISH && !Cooldown.checkCooldown(msg)) {
		Cooldown.updateTimeStamp(msg);
		commandFish(msg);
	}
	
	//Randomly choose a user
	if (msg.content === "!roulette" && FEATURE_ROULETTE && !Cooldown.checkCooldown(msg)) {
		Cooldown.updateTimeStamp(msg);
		commandRoulette(msg);
	}
	
	//Shitposting from reddit's JSON fetch
	if (msg.content === "!shitpost" && FEATURE_SHITPOST && !Cooldown.checkCooldown(msg))
	{
		ShitPost.fetchShitPost(function (error,data) {
			if (error == null) {
				Cooldown.updateTimeStamp(msg);
				messageResponse=data;
				bot.sendMessage(msg.channel,data);
			}
		});
	}
	
	/* Commands that are mainly for debugging purposes:
		* !ID
		* !ConfigTest
	*/
		
	//if message is "!ID"
	if (msg.content === "!ID" && FEATURE_ID && !Cooldown.checkCooldown(msg)) {
		Cooldown.updateTimeStamp(msg);
		commandID(msg);
	}
	
	//if message is !ConfigTest, test variables in config.json and report errors.
	if (msg.content === "!configtest" && FEATURE_CONFIGTEST && !Cooldown.checkCooldown(msg)) {
		ConfigTest.runConfigTest(bot,msg, function (error,data) {
			Cooldown.updateTimeStamp(msg);
			if (error) {
				messageResponse=error;
			}
			if(!error) {
				messageResponse=data;
			}
			console.log(messageResponse);
			bot.sendMessage(msg.channel,messageResponse);
		});
	}
	
});

//when the bot receives user status update
bot.on("presence", function (usr, status, gID) {
	//If not enabled don't do anything
	if (!FEATURE_STATUSNOTIFY) return;
	//If the user status is online
	if (status == "online") {
		//If they are online and status is null, this is called when quitting a game too but that's acceptable for me.
		if (gID === undefined) {
			//send to the User Log Channel
			bot.sendMessage(ConfigDetails.statusLogChannel, "✅" + usr.username + " is now " + status, function(error, sentMsg) {
				if (error != null) console.log(ConfigDetails.statusLogChannel + error);
			});
		}
		
	} else if (status == "offline") {
		//Send to the User Log Channel that he's offline
		bot.sendMessage(ConfigDetails.statusLogChannel, "❌" + usr.username + " is now " + status);
	} else if (status == "idle") {
		//Send to the User Log Channel that he's idle
		bot.sendMessage(ConfigDetails.statusLogChannel, "🕓" + usr.username + " is now " + status);
	} else {
		console.Log("Status Update: Error");
	}
});

//Setup called when bot first created.
function botInitialization() {
	//Let the bot login.
	bot.login(AuthDetails.email, AuthDetails.password, function(error, token) {
		if (error) {
			console.log("Login Errors: " + error);
		}
	});
}

botInitialization();
