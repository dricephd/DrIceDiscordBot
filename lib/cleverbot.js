var Cleverbot = require('cleverbot-node');

var CBot = new Cleverbot;

sendMessage = function sendMessage(message,callback) {
	
	CBot.write(message['message'],function(response) {
		return callback(null,response['message']);
	});
	
};

//On file load it'll auto prepare
Cleverbot.prepare(
	function() {
		console.log("Cleverbot Prepared");
		sendMessage({message:"Test Input"},function callback() {});
	}
);

module.exports = {sendMessage};