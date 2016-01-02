#DrIceDiscordBot#
Bot utilizing [Discord.js](https://github.com/hydrabolt/discord.js) as it's primary backbone.

![Platforms](https://img.shields.io/badge/OS%20Tested-Win%2010%2C%20WinServer%202012%20R2-brightgreen.svg) [![Build Status](https://travis-ci.org/dricephd/DrIceDiscordBot.svg?branch=development)](https://travis-ci.org/dricephd/DrIceDiscordBot) [![PT](https://img.shields.io/badge/Planning%20Tool-PivotalTracker-lightgrey.svg)](https://www.pivotaltracker.com/n/projects/1505644)
##Current Features in 0.4.0##
- Status logging to channel ID supplied in config.json
- !help command lists all current commands
- !configtest command for testing your config
- !fish command to slap yourself about with one of 1,068 species of fish
- !roulette to select a user at random that is online
- !shitpost command to place shitpost from certain subreddits
- Config.json controls what functions are enabled in the bot, by default it is currently everything

##Planned Features for 1.0.0##
[Everything Above v1.0.0 in PT] (https://www.pivotaltracker.com/n/projects/1505644)

##Installation##
### Pre-Requesites
- node.js
- NPM Package Manager

###Running for the first time###
1. Extract desired branch to a folder
2. Run `npm install` while within the folder
3. Fill out auth.json with desired account credentials
4. Setup config.json
5. `node client.js` in command line