/*
	Plays music from a list
*/

//modules
var fifo = require('fifo')() //Holds our queue

//Vars
var bot; //Holds bot object that gets passed from main file
var musicChannel; //Target Voice Channel
var textChannel; //Target Text Channel
var playlist = {}; //Obvious

//Requires: discord.js bot object, voice channel name, text channel name
function initialize(botObj,voiceChannel,textChannel) {
	bot = botObj;
	musicChannel = voiceChannel;
	
	/*bot.joinVoiceChannel(bot.servers[0].channels[3],function(error,connection) {
		connection.playFile("C:\Users\Matt\DrIceDiscordBot\test.mp3",{
			volume: 0.25
		},function (error,data) {
			console.log(error);
			console.log(data);
		});
	});*/
}

function playNextSong() {
	fifo.shift();
}

function addToPlaylist(data) {
	fifo.push(data);
}

function removeFromPlaylist(data) {
	fifo.remove(data);
}

function skipPlaylist() {
	
}

module.exports = {initialize,addToPlaylist,removeFromPlaylist,skipPlaylist};