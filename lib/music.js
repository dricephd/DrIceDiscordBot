/*
	Plays music from a list
*/

var bot; //Holds bot object that gets passed from main file
var musicChannel; //Target Voice Channel
var playlist = {}; //Obvious

function initialize(botObj,channelObj) {
	bot = botObj;
	musicChannel = channelObj;
}

function addToPlaylist(data) {
	
}

function removeFromPlaylist(data) {
	
}

function skipPlaylist() {
	
}

module.exports = {initialize,addToPlaylist,removeFromPlaylist,skipPlaylist};