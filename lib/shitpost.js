var request = require("request");

var sourceURL = undefined;

module.exports = {
	Setup : function(configArray) {
		sourceURL = configArray;
	},
	fetchShitPost : function(callback) {
		//#TODO: We really need caching because reddit fetch times SUCK!
		//Returns String of cleaned up json that is safe for the chat
		
		var ranSelection; //Where we'll store our random selection for processing
		var shitpostResponse=null; //The message we send back
		var shitpostLoops=0;
		
		//Error handling for bad config file
		if (sourceURL == undefined) {
			return callback("Error: No Sources are defined in config.json",null);
		}
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
			
			//Error handling for no proper response
			if (body.data == undefined) {
				return callback("Error: No Response from site",null);
			}
			
			//Randomly select a shitposting source then apply logic
			ranSelection = body.data.children[Math.floor(Math.random()*body.data.children.length)];
			
			while (shitpostResponse == null) {
				shitpostLoops++;
				
				//If it's a self post or a reddit post
				if (ranSelection.data.domain.indexOf("self.") > -1 || ranSelection.data.domain.indexOf("reddit") > -1) {
					//If It's emojipasta we need no real handling
					shitpostResponse = ranSelection.data.selftext;
				}
				
				//If It's from imgur
				if (ranSelection.data.domain.indexOf("imgur") > -1) {
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
				
				//If It's from youtube
				if (ranSelection.data.domain.indexOf("youtube") > -1 || ranSelection.data.domain.indexOf("youtu.be") > -1) {
					shitpostResponse = ranSelection.data.url;
				}
				
				//Tumblr...
				if (ranSelection.data.domain.indexOf("tumblr") > -1) {
					shitpostResponse = ranSelection.data.url;
				}
				
				//ShittyReactionGifs needs it's own handling because the title gives contextual
				if (ranSelection.data.subreddit == "shittyreactiongifs") {
					shitpostResponse = ranSelection.data.title + "\n";
					shitpostResponse += ranSelection.data.url;
				}
				
				
				//NSFW is scary!!!!
				if (ranSelection.data.over_18 == true) {
					shitpostResponse = null;
				}
				
				if (shitpostLoops > 100) {
					return callback("Error: Got stuck on a shitpost. " + ranSelection.data.url + " " + ranSelection.data.domain,"`Error: I got stuck :(`");
				}
				
			}
			return callback(null, shitpostResponse);
		});
	}
};