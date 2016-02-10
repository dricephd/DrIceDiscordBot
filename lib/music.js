/*
	Plays music from a list
*/

var bot; //Holds bot object that gets passed from main file
var musicChannel; //Target Voice Channel
var playlist = {}; //Obvious

function initialize(botObj,channelObj) {
	bot = botObj;
	musicChannel = channelObj;
	bot.createChannel(bot.servers[0], "testing", "voice", function(error,channel) {
		bot.joinVoiceChannel(channel,function(error,connection) {
			connection.playFile("C:\Users\Matt\Music\Legend of Zelda - Twilight Princess\Zelda Twilight Princess - Midnas Lament.mid",{
				volume: 0.25
			},function (error,data) {
				console.log(error);
				console.log(data);
			});
		});
	});
}

function addToPlaylist(data) {
	
}

function removeFromPlaylist(data) {
	
}

function skipPlaylist() {
	
}

module.exports = {initialize,addToPlaylist,removeFromPlaylist,skipPlaylist};