/*
	Plays music from a list
*/

//modules
var fifo = require('fifo')() //Holds our queue
var request = require('request');

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
	
	if (currentSong != "None") {
		var time = playBack/1000;
		var minute = 0;
		while (time>60) {
			minute+=1;
			time-=60;
		}
		if (time > 10)
			time = minute + ":" + Math.floor(time);
		if (time < 10)
			time = minute + ":0" + Math.floor(time);
		bot.setChannelTopic(musicStatusChannel,"[" + (time) + "] - " + currentSong.title);
	}
	if (currentSong == "None") {
		bot.setChannelTopic(musicStatusChannel,"Nothing playing");
	}
	
	setTimeout(checkQueue, 5000);
}

function playNextSong() {
	playBack = 0;
	currentSong = fifo.shift();
	bot.sendMessage(musicStatusChannel,"Now Playing: " + currentSong.title + " - " + currentSong.requester);
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
			msgResponse += "*" + currentSong.title + "*";
		}
		if (currentSong == "None") {
			msgResponse += "*😢 The list is empty*";
		}
		for (var node = fifo.node; node; node = fifo.next(node)) {
			if (node.value != undefined && node.value.title != undefined) {
				msgResponse += "\n" + node.value.title + " - " + node.value.requester;
			}
		}
		bot.sendMessage(musicStatusChannel,msgResponse);
		return;
	}
	var baseURL = "https://savedeo.com/download?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D";
	var videoID = null;
	
	//find the exact video ID
	var searchToken = "?v=";
	var i = data.indexOf(searchToken);
	
	if(i == -1) {
		searchToken = "&v=";
		i = data.indexOf(searchToken);
	}
	
	if(i == -1) {
		searchToken = "youtu.be/";
		i = data.indexOf(searchToken);
	}
	
	if(i != -1) {
		var substr = data.substring(i + searchToken.length);
		var j = data.indexOf("&");
		
		if(j == -1) {
			j = data.indexOf("?");
		}
		
		if(j == -1) {
			videoID = substr;
		} else {
			videoID = substr.substring(0,j);
		}
	} else {
		videoID = data;
	}
	
	//Borowing heavily from discord-music-bot...
	request(baseURL + videoID, function (error, response, body) {
		
		if (!error && response.statusCode == 200) {
			var cheerio = require('cheerio'), $ = cheerio.load(body);
			var videoTitle = $('title').text();
			
			if(videoTitle.indexOf('SaveDeo') != -1) {
				bot.reply(musicStatusChannel, "Sorry, I couldn't get audio track for that video.");
				return;
			}
			
			var audioURL = $('#main div.clip table tbody tr th span.fa-music').first().parent().parent().find('td a').attr('href');
			
			fifo.push({
				title: videoTitle,
				url: audioURL,
				requester: author.name
			});
			bot.sendMessage(musicStatusChannel,"Added to playlist: " + videoTitle)
			
		} else {
			bot.sendMessage(musicStatusChannel, "There was an error adding to the queue");
			console.log(error);
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

module.exports = {initialize,addToPlayList,skipPlayList,getChannel,getCurrentSong};