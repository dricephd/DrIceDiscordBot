/*
	Plays music from a list
*/

//modules
var fifo = require('fifo')() //Holds our queue
var request = require('request');
var fs = require('fs');
var youtubedl = require('youtube-dl');
var path = require('path');
var probe = require('node-ffprobe');

//Vars
var bot = null; //Holds bot object that gets passed from main file, stick a dummy in there first...
var musicChannel; //Target Voice Channel
var musicStatusChannel; //Target Text Channel
var voiceConnection;
var playBack = 0; //Current Seek Time

var currentSong = "None"; //Current song
var playlist = {}; //Obvious

//Requires: discord.js bot object, voice channel name, text channel name
function initialize(botObj,voiceChannel,textChannel) {
	bot = botObj;
	musicChannel = voiceChannel;
	
	for (var i in bot.servers[0].channels) {
		//If matches text
		if (bot.servers[0].channels[i].name == textChannel && bot.servers[0].channels[i].type == "text") {
			musicStatusChannel = bot.servers[0].channels[i];
			bot.sendMessage(musicStatusChannel,"Entered Music Channel. Type !help for commands.");
		}
		//if matches voice
		if (bot.servers[0].channels[i].name == voiceChannel && bot.servers[0].channels[i].type == "voice") {
			musicChannel = bot.servers[0].channels[i];
			bot.joinVoiceChannel(musicChannel,function(error,connection) {
				if (!error) { voiceConnection = connection; }
				if (error) { console.log(error); }
			});
		}
	}
	
	checkQueue();
}

//Queue handler
var checkQueue = function() {
	
	if((fifo.first() != null) && !bot.voiceConnection.playing) {
		playNextSong();
	}
	if ((fifo.first() == null) && bot.voiceConnection == undefined) {
		currentSong = "None";
	}
	
	setTimeout(checkQueue, 5000);
}

function playNextSong() {
	playBack = 0;
	currentSong = fifo.shift();
	bot.sendMessage(musicStatusChannel,"Now Playing: " + currentSong.title + " - " + currentSong.requester);
	bot.setStatus("online",currentSong.title,function (error) {
		if (error) console.log(error);
	});
	voiceConnection.playFile(currentSong.url,
	{
		volume: 0.25
	}, function(error,intent) {
		
		if (error) console.log(error);
		
		intent.on("time",function(playTime) {
			playBack = playTime;
		});
		
		intent.on("end",function() {
			currentSong = "None";
		});
	});
}

function addToPlayList(data,author) {
	if (data == null) {
		var msgResponse = "__**Playlist**__ \n";
		if (currentSong != "None") {
			msgResponse += "*" + currentSong.title + "* - " + currentSong.requester;
		}
		if (currentSong == "None") {
			msgResponse += "*The list is empty*";
		}
		for (var node = fifo.node; node; node = fifo.next(node)) {
			if (node.value != undefined && node.value.title != undefined) {
				msgResponse += "\n" + node.value.title + " - " + node.value.requester;
			}
		}
		bot.sendMessage(musicStatusChannel,msgResponse);
		return;
	}
	
	var vidUrl = data;
	
	if (vidUrl.indexOf("?list") > -1) {
		bot.sendMessage(musicStatusChannel,"I'm sorry I can't process playlists");
		return;
	}
	
	bot.sendMessage(musicStatusChannel,"Processing video...");
	
	//download audio only, formatted mp3, ignore playlists
	youtubedl.exec(vidUrl, ['-x', '--audio-format', 'mp3','--no-playlist','--restrict-filenames','-o','music_cache/%(id)s.%(ext)s','-r','3.0M'], {}, function (err, output) {
		
		if (err) {
			console.log(err);
			bot.sendMessage(musicStatusChannel,"There was an error fetching this link for addition to the playlist");
		}
		if (!err) {
			youtubedl.getInfo(vidUrl,function(error,info) {
				if (!error) {
					
					var filePath = path.resolve(__dirname,"../music_cache/",info.id + ".mp3");
					
					probe(filePath,function (error, probeData) {
						
						fifo.push({
							title: info.title,
							url: filePath,
							requester: author.name,
							duration: probeData.format.duration
						});
						
						bot.sendMessage(musicStatusChannel,"Added to playlist: " + info.title);
					});
				}
			});
		}
	});
}

function skipPlayList() {
	if (fifo.first() != null) {
		voiceConnection.stopPlaying();
		currentSong = "None";
		bot.sendMessage(musicStatusChannel,"Skipping song...");
	}
	if (fifo.first() == null) {
		bot.sendMessage(musicStatusChannel,"Queue is empty");
	}
}

function getChannel(type) {
	if (type == "text") { return musicStatusChannel.name; }
	if (type == "voice") { return musicChannel.name; }
}

function getCurrentSong() {
	if (currentSong.title == undefined) {
		return "Nothing. It's so lonely and quiet in here."
	}
	return currentSong.title + " - " + currentSong.requester;
}

function getTimeStamp(seconds) {
	var time=seconds;
	var minute = 0;
	while (time>60) {
		minute+=1;
		time-=60;
	}
	if (time >= 10)
		time = minute + ":" + Math.floor(time);
	if (time < 10)
		time = minute + ":0" + Math.floor(time);
	
	return time;
}

// This function is used by &init to handle connection errors
function error(e) {
	console.log(e.stack);
	process.exit(0);
}

module.exports = {initialize,addToPlayList,skipPlayList,getChannel,getCurrentSong};