#DrIceDiscordBot#

Bot utilizing [Discord.js](https://github.com/hydrabolt/discord.js) as it's primary backbone.

![Platforms](https://img.shields.io/badge/OS%20Tested-Win%2010%2C%20WinServer%202012%20R2-brightgreen.svg) [![Build Status](https://travis-ci.org/dricephd/DrIceDiscordBot.svg?branch=development)](https://travis-ci.org/dricephd/DrIceDiscordBot) [![PT](https://img.shields.io/badge/Planning%20Tool-PivotalTracker-lightgrey.svg)](https://www.pivotaltracker.com/n/projects/1505644)
##Current Features in DEV-0.6.0##

DIDBC is a PingPong bot that responds to chat commands.

#### Fun
- !fish command to slap yourself about with one of 1,068 species of fish
- !roulette to select a user at random that is online
- !shitpost command to place shitpost from certain subreddits
- Ability to add custom PingPong commands with !add [command] [response] and !delete [command]
 
#### Server Management
- !help command lists all current commands
- Status logging to specified channel
- Config.json to control what's on or off
- Cooldown to keep people from spamming commands
- Auto-reconnect for when your bot gets dropped and you aren't around to fix it

#### Debug
- !getlog fetches the console log and send it through discord
- !configtest command for testing your config

##Planned Features for 1.0.0##
[Everything Above v1.0.0 in PT] (https://www.pivotaltracker.com/n/projects/1505644)

##Installation##
### Pre-Requesites
These are more specifically detailed in the package.json file
- NPM Package Manager
 - discord.js
 - moment
 - node.js
 - request
 - sqlite

If you want to use the music portion:
- Python that has been placed in %PATH% (Windows)
- ffmpeg that has been placed in %PATH% (Windows)
- [The ability to compile npm packages as outlined here] (https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#prerequisites)

###Running for the first time###
1. Extract desired branch to a folder
2. Run `npm install` while within the folder
3. Fill out auth.json with desired account credentials
4. Setup config.json
5. `node client.js` in command line
