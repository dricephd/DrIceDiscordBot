/*
	This is DrIceBot, mostly a ping-pong bot that responds to commands.
	Currently it is best configured when only running on one server due to the way config.json is utilized.
	VERSION: DEV-0.5.0
*/

const VERSION = "DEV-0.6.0";

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
const FEATURE_RECONNECT = ConfigDetails.featureStatus.reconnect;
const FEATURE_GETLOG = ConfigDetails.featureStatus.getlog;

//Set Non-Feature Constants
const CONFIG_COOLDOWN = ConfigDetails.cooldownTime;

//Load Dependencies
var Discord = require("discord.js");
var Moment = require('moment');
var fs = require('fs'); //Used for File Input Output
var PingPong = require("./lib/pingpong.js");
if (FEATURE_SHITPOST) var ShitPost = require("./lib/shitpost.js");
if (FEATURE_CONFIGTEST) var ConfigTest = require("./lib/configtest.js");
var Cooldown = require("./lib/cooldown.js");

//Spawn globally required classes
var bot = new Discord.Client();

//Setup any necessary folders
if (!fs.existsSync("./logs")) {
	fs.mkdirSync("./logs");
}

//Global Variables
var loginTimeDelay = 0;
var log_filename = "./logs/" + Moment().format("MM-DDD-YY HH-mm") + ".log";
var log_file = fs.createWriteStream(log_filename, {flags : 'w'});
var customCommands = {};

//Setup console log function
console.logCopy = console.log.bind(console);
console.log = function(data) {
	var timestamp = '[' + Moment().format("MM/DDD/YYYY HH:mm:ss") + '] ';
	log_file.write(timestamp + data + '\n');
    this.logCopy(timestamp, data);
};

//Send enabled help commands to requester
commandHelp = function(msg) {
	//Buffer all of our response then send it so we don't get weird ordering
	var msgResponse="";
	//DM The commands to the caller
	msgResponse += "**__Commands for DIDBC bot Ver. " + VERSION + "__**\n";
	msgResponse += "!help - You're already doing it!\n";
	
	//User Functions
	if (FEATURE_FISH) msgResponse += "!fish - Slaps requester about with a random fish!\n";
	if (FEATURE_ROULETTE) msgResponse += "!roulette - Choose an active user in the channel at random.\n";
	if (FEATURE_SHITPOST) msgResponse += "!shitpost - Post a shitpost from one of several subreddits.\n";
	
	//Show any enabled features that don't have a command
	msgResponse += "\n**__Enabled Features__**\n";
	if (FEATURE_STATUSNOTIFY) msgResponse += "StatusNotify - Places alert in <#" + ConfigDetails.statusLogChannel + "> channel when a user changes status.\n";
	msgResponse += "Cooldown - User can't use command more than once every " + CONFIG_COOLDOWN + " seconds.\n";
	if (FEATURE_RECONNECT) msgResponse += "Reconnect - Bot will attempt to reconnect if taken offline unexpectedly.\n";
	
	//Functions for Debugging
	msgResponse+= "\n**__Debug Commands__**\n";
	if (FEATURE_ID) msgResponse += "!ID - PM the Channel and User ID to caller and print them both in the log.\n";
	if (FEATURE_CONFIGTEST) msgResponse += "!configtest - Test the settings in config.json\n";
	if (FEATURE_GETLOG) msgResponse += "!getlog - Bot will send you the log\n";
	
	//Custom Commands
	msgResponse += "\n**__Custom User Commands__**\n";
	msgResponse += "!add [command] [response] - adds a custom command\n";
	msgResponse += "!delete [command] [response] - delete a custom command\n";
	
	for (var i in customCommands) {
		msgResponse += customCommands[i]["command"] + "\n";
	}
	
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
	Cooldown.Setup(bot,CONFIG_COOLDOWN, bot.users);
	
	//Get Commands
	customCommands = PingPong.getCommands();
	
	console.log("Bot Version " + VERSION);
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
	loginTimeDelay=0; //Reset login timeout
});

//when the bot receives a message
bot.on("message", function (msg) {
	var messageResponse="";
	/* Commands for primary use
		* !help
		* !fish
		* !roulette
		* !shitpost
		* !add
		* !remove
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
			if (error) {
				console.log(error);
			}
		});
	}
	if (msg.content.indexOf("!add") > -1 && !Cooldown.checkCooldown(msg))
	{
		var command = msg.content.split(' ')[1];
		var response = msg.content.substring(msg.content.indexOf(' ')+1);
		response = response.substring(response.indexOf(' ')+1);
		
		PingPong.insertCommand(command, response, function (error,data) {
			if (!error) console.log(data);
			if (error) console.log(error);
			customCommands = PingPong.getCommands();
			bot.sendMessage(msg.channel,data);
			Cooldown.updateTimeStamp(msg);
		});
	}
	if (msg.content.indexOf("!delete") > -1 && !Cooldown.checkCooldown(msg))
	{
		var command = msg.content.split(' ')[1];
		PingPong.deleteCommand(command, function (error,data) {
			if (!error) console.log(data);
			if (error) console.log(error);
			
			customCommands = PingPong.getCommands();
			bot.sendMessage(msg.channel,data);
			Cooldown.updateTimeStamp(msg);
		});
	}
	
	//Check for custom commands here
	for (var i in customCommands) {
		if (msg.content === customCommands[i]["command"] && !Cooldown.checkCooldown(msg)) {
			bot.sendMessage(msg.channel,customCommands[i]["response"]);
			Cooldown.updateTimeStamp(msg);
		}
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
	
	//Fetches log and sends it over discord
	if (msg.content ==="!getlog" && FEATURE_GETLOG && !Cooldown.checkCooldown(msg)) {
		bot.sendFile(msg.author,log_filename,"console.log",function (error,message) {
			if (error) {
				bot.sendMessage(msg.author,error);
				console.log(error);
			}
			if (!error) {
				console.log("Logs sent to " + msg.author);
			}
			
		});
	}
	
	//Restarts the bot
	if (msg.content === "!restart") {
		console.log(msg.author + msg.author.name + " has restarted the bot.");
		bot.logout();
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
			bot.sendMessage(ConfigDetails.statusLogChannel, "✅" + Moment().format("h:mm a ") + usr.username + " is now " + status, function(error, sentMsg) {
				if (error != null) console.log(ConfigDetails.statusLogChannel + error);
			});
		}
		
	} else if (status == "offline") {
		//Send to the User Log Channel that he's offline
		bot.sendMessage(ConfigDetails.statusLogChannel,"❌" + Moment().format("h:mm a ") + usr.username + " is now " + status);
	} else if (status == "idle") {
		//Send to the User Log Channel that he's idle
		bot.sendMessage(ConfigDetails.statusLogChannel,"🕓" + Moment().format("h:mm a ") + usr.username + " is now " + status);
	} else {
		console.Log("Status Update: Error");
	}
});

//Setup called when bot first created.
function botInitialization() {
	//Check config.json VER against our scripts
	if (ConfigDetails.version != VERSION) {
		console.log("WARNING : Config.json and script version do not match! Check config.json.example for any missing values!")
		console.log("Config.json Version " + ConfigDetails.version);
	}
	
	//Initialize DB
	PingPong.initializeDB();
	
	//Let the bot login.
	bot.login(AuthDetails.email, AuthDetails.password, function(error, token) {
		//this callback seems to be VERY unreliable, DONT USE
		if (error) {
			console.log("Login Errors: " + error);
		}
	});
}

//when the bot disconnects
bot.on("disconnected", function () {
	//alert the console
	console.log("Disconnected!");
	if (loginTimeDelay < 120000) loginTimeDelay+=20000; //Up to 2 minute delay so we don't get ourselves banned
	
	//Close Db since we open it on each login...
	PingPong.closeDb();
	
	if (FEATURE_RECONNECT) {
		//Wait X seconds before reconnecting
		console.log("Attempting login in " + loginTimeDelay/1000 + " seconds...");
		setTimeout(botInitialization,loginTimeDelay);
	}
	if (!FEATURE_RECONNECT) {
		//If we don't want to reconnect just exit
		process.exit(1);
	}
	
});

botInitialization();
