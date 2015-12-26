var request = require("request");

module.exports = {
	fetchShitPost : function(callback) {
		//#TODO: We really need caching because reddit fetch times SUCK!
		//Returns String of cleaned up json that is safe for the chat
		
		var url = ["https://www.reddit.com/r/anime_irl/.json","https://www.reddit.com/r/emojipasta/.json","https://www.reddit.com/r/youdontsurf/.json",
			"https://www.reddit.com/r/me_irl/.json"];
		var ranSelection; //Where we'll store our random selection for processing
		var shitpostResponse; //The message we send back
		
		request({
			url: url[Math.floor(Math.random()*url.length)],
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
			
			//NSFW is scary!!!!
			if (ranSelection.data.over_18 == true) {
				return callback(null, fetchShitPost());
			}
			
			if (ranSelection.data.subreddit == "emojipasta") {
				//If It's emojipasta we need no real handling
				shitpostResponse = ranSelection.data.selftext;
			}
			if (ranSelection.data.subreddit == "anime_irl" || ranSelection.data.subreddit == "youdontsurf" || ranSelection.data.subreddit == "me_irl") {
				shitpostResponse = ranSelection.data.url;
				
				if(shitpostResponse.indexOf("/a/") > -1) {
					//Try again because we don't like albums. Hard to embed
					return callback(null, fetchShitPost());
				}
				
				//Used to check if an imgur image is "embeddable" meaning does it has .jpg,.gif,.gifv, or .png
				if(!(shitpostResponse.indexOf(".jpg") > -1 || shitpostResponse.indexOf(".gif") > -1 || shitpostResponse.indexOf(".png") > -1)) {
					//If not we can resolve it ourself.
					shitpostResponse = shitpostResponse + ".jpg";
				}
			}
			return callback(null, shitpostResponse);
		});
	}
};