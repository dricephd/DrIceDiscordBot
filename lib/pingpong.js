/**
 * Shows how to use chaining rather than the `serialize` method.
 */

var sqlite3 = require('sqlite3').verbose();
var db;
var commands = {}; //Will hold all of our commands and responses

function initializeDB() {
	console.log("Opening DIDBC.sqlite3 DB...");
    db = new sqlite3.Database('DIDBC.sqlite3');
	
	//Create Table that will hold our pingpong commands if it doesn't exist
	db.run("CREATE TABLE IF NOT EXISTS PingPong (command TEXT, response TEXT)");
	//db.run("INSERT INTO PingPong (command,response) VALUES('!test','herpaderp')");
	readAllRows();
}

/*function insertRows() {
    console.log("insertRows Ipsum i");
    var stmt = db.prepare("INSERT INTO lorem (info,info2) VALUES (?,?)");

    for (var i = 0; i < 10; i++) {
        stmt.run("ipsum " + i + ",ipsum " + i);
    }

    stmt.finalize(readAllRows);
}*/

//Gets all current commands and reads into the commands[] array
function readAllRows() {
	commands = {}; //Wipe it out since we're about to repopulate it
    db.all("SELECT rowid AS id, command, response FROM PingPong", function(err, rows) {
        rows.forEach(function (row) {
			commands[row.id] = {
				"command" : row.command,
				"response" : row.response
			};
        });
    });
}

function closeDb() {
	console.log("Closing DIDBC.sqlite3 DB...");
    db.close();
}

module.exports = {initializeDB};