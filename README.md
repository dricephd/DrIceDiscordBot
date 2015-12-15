#DrIceDiscordBot#
Bot utilizing [Discord.js](https://github.com/hydrabolt/discord.js) as it's primary backbone.

##Current Features in 0.2.0##
- Status logging to channel ID supplied in config.json
- !help command lists all current commands
- !configtest command for testing your config
- !fish command to slap yourself about with one of 1,068 species of fish
- !roulette to select a user at random that is online

##Planned Features for 1.0##
- Bot first setup assistance and error checking (Not everyone is technical)
- Rewrite config.json handling to be able to enable/disable features
- User Agreement first time they join the server
  - Options in config.json
  - Registration channel where "I agree" must be typed to enter

##Installation##
### Pre-Requesites
- discord.js required
  - node.js required by discord.js
- NPM Package Manager

###Running for the first time###
1. Extract desired branch to a folder
2. Run `npm install` while within the folder
3. Fill out auth.json with desired account credentials
4. `node client.js`
5. If you'd like to enable the status reporting enter the channel ID number into config.json (STRIP OUT '<','#', and '>' from what you get in the ``!ID`` command!)
