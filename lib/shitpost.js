var request = require("request");

const sourceURL = ["https://www.reddit.com/r/anime_irl/.json","https://www.reddit.com/r/emojipasta/.json",
	"https://www.reddit.com/r/youdontsurf/.json","https://www.reddit.com/r/me_irl/.json"];

module.exports = {
	fetchShitPost : function(callback) {
		//#TODO: We really need caching because reddit fetch times SUCK!
		//Returns String of cleaned up json that is safe for the chat
		
		var ranSelection; //Where we'll store our random selection for processing
		var shitpostResponse=null; //The message we send back
		
		request({
			url: sourceURL[Math.floor(Math.random()*sourceURL.length)],
			json: true,
			maxSockets: 10
		}, function fetchShitPostJSON(error, response, body) {
			
			if (error != null) { 
				//bot.sendMessage(msg.channel, "There was an error fetching the shitpost.");
				console.log(error);
				return callback(error, null);
			}

			//Randomly select a shitposting source then apply logic
			ranSelection = body.data.children[Math.floor(Math.random()*body.data.children.length)];
			
			while (shitpostResponse == null) {
			
				if (ranSelection.data.subreddit == "emojipasta") {
					//If It's emojipasta we need no real handling
					shitpostResponse = ranSelection.data.selftext;
				}
				if (ranSelection.data.subreddit == "anime_irl" || ranSelection.data.subreddit == "youdontsurf" || ranSelection.data.subreddit == "me_irl") {
					shitpostResponse = ranSelection.data.url;
					
					//Make sure we don't run into any errors that crash the code
					if (shitpostResponse != null) {
					
						//Used to check if an imgur image is "embeddable" meaning does it has .jpg,.gif,.gifv, or .png
						if(!(shitpostResponse.indexOf(".jpg") > -1 || shitpostResponse.indexOf(".gif") > -1 || shitpostResponse.indexOf(".png") > -1)) {
							//If not we can resolve it ourself.
							shitpostResponse = shitpostResponse + ".jpg";
						}
						
						if(shitpostResponse.indexOf("/a/") > -1) {
							//Try again because we don't like albums. Hard to embed
							shitpostResponse = null;
						}
					}
				}
				
				//NSFW is scary!!!!
				if (ranSelection.data.over_18 == true) {
					shitpostResponse = null;
				}
				
			}
			return callback(null, shitpostResponse);
		});
	}
};