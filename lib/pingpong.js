/**
 * Checks against database entries for pingpong commands
 */

var sqlite3 = require('sqlite3').verbose();

var db;
var commands = {}; //Will hold all of our commands and responses

function initializeDB() {
	db = new sqlite3.Database('DIDBC.sqlite3');
	
	console.log("Opening DIDBC.sqlite3 DB...");
	
	//Create Table that will hold our pingpong commands if it doesn't exist
	db.run("CREATE TABLE IF NOT EXISTS PingPong (command TEXT, response TEXT)", function(error,data) {
		if (!error)
		{
			db.all("SELECT rowid AS id, command, response FROM PingPong", function(err, rows) {
				if (!err) {
					rows.forEach(function (row) {
						commands[row.id] = {
							"command" : row.command,
							"response" : row.response
						};
					});
				}
				if (err) console.log(err);
			});
		}
		if (error) console.log(error);
	});
}

function insertCommand(command, response, callback) {
	
	//If we don't have paramaters just quit
	if (command == undefined || response == undefined) {
		return callback("Missing paramater",null);
	}
	
	//Check if we already have that kind of command
	for (var i in commands)
	{
		if (commands[i]["command"] == command) return callback("Command already exists",null);
	}
	
	var query = "INSERT INTO PingPong (command,response) VALUES(\'" + command + "\',\'" + response + "\')";
	db.run(query, function(error,data) {
		db.all("SELECT rowid AS id, command, response FROM PingPong", function(err, rows) {
			if (!err) {
				rows.forEach(function (row) {
					commands[row.id] = {
						"command" : row.command,
						"response" : row.response
					};
				});
			}
			if (err) console.log(err);
			return callback(null,"Inserted " + command);
		});
	});
}

function deleteCommand(command,callback) {
	if (command == undefined) {
		return callback("Missing Parameter",null);
	}
	var query = "DELETE FROM PingPong WHERE command IS \'" + command + "\'";
	db.run(query, function(error,data) {
		db.all("SELECT rowid AS id, command, response FROM PingPong", function(err, rows) {
			commands = {}; //Very important...
			if (!err) {
				rows.forEach(function (row) {
					commands[row.id] = {
						"command" : row.command,
						"response" : row.response
					};
				});
			}
			if (err) console.log(err);
			return callback(null,"Deleted " + command);
		});
	});
}

function getCommands() {
	return commands;
}

function closeDb() {
	console.log("Closing DIDBC.sqlite3 DB...");
    db.close();
}

module.exports = {initializeDB,closeDb,insertCommand,deleteCommand,getCommands};