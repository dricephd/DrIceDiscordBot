var Discord=require("discord.js");

var ConfigDetails; //config.json holder
var responseString; //What we'll return to the function caller
var responseError; //Return an error if we find one
var responseBot; //Bot we're using to test

module.exports = {
	/*
		Takes a bot and msg object from discord.js and returns callback(error, responseString)
	*/
	runConfigTest : function(bot,msg,callback) {
		responseString="";
		responseError=null;
		responseBot=bot;
		testCompleted=false;
		
		try {
			ConfigDetails = require("../config/config.json");
		}
		catch (error) {
			responseError = error;
			return callback(responseError,null);
		}
		/*Verify Permissions:
			* manageRoles
			* manageChannels
			
			Otherwise refuse to run.
		*/
		//console.log("User Calling !configtest has permissions: " + permissions);
	
		//Run Config Tests
		responseString += "[Config.json Tests running...]\n";
		//Print status of the features
		var statString;
		
		responseString += "... Feature Enable/Disable Status\n";
		for (var featStat in ConfigDetails.featureStatus) {
			statString = ConfigDetails.featureStatus[featStat];
			if (statString === "1") responseString += ("[ O N ] ... " + featStat + "\n");
			if (statString === "0") responseString += ("[ OFF ] ... " + featStat + "\n");
		}
		statusNotifierTest(function channelTest() {
			responseString += "[...Config.json Tests Completed]"
			return callback(responseError,responseString);
		});
	}
};

//Test Status Notifier
function statusNotifierTest(callback) {
	//If it isn't enabled skip the test entirely
	if (!ConfigDetails.featureStatus.statusNotifier) callback();
	
	//Test status notifier
	responseString += "... Status Notifier Test\n";
	responseBot.sendMessage(ConfigDetails.statusLogChannel, "Configuration Test for Log Channel " + "<#" + ConfigDetails.statusLogChannel + ">", function(error, sentMsg) {
		responseString += "Channel ID: " + ConfigDetails.statusLogChannel + "\n";
		if (error) {
			responseString += "StatusNotifier Channel: " + error +"\n";
			responseError = error;
		}
		if (!error) {
			responseString += "StatusNotifier Channel: Success\n";
			responseError = null;
		}
		return callback();
	});
}