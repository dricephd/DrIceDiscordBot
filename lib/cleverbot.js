var Cleverbot = require('cleverbot-node');
cleverbot = new Cleverbot;

cleverbot.prepare();

cleverbot.write(cleverMessage, function (response) {
	alert(response.message);
});