const fs = require('fs');
const config = require('./config.js');
const Discord = require('discord.js');
const bot = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
	ws: {
		properties: {
			$browser: 'Discord iOS'
		}
	}
});
const embeds = require('./embeds.js');
let traditionalCommands;
let onMessageCreate;
const lib = require("instagram-apis");
bot.ig = new lib();
//const database = require('./database.js')(bot); // to do

process.on('uncaughtException', function(err) {
    console.log(err);
	const embed = embeds.jsError('uncaughtException', err, true);
	bot.supportServer.channels.errors.send({ embeds: [embed] })
	.catch(error => console.log('now something is really fucked up', error));
});

bot.reloadTraditionalCommands = () => { 
	// commands like @bot <command> instead of /command
	// i dont think bot will have any command for users, if it will I make them with slash commands
	if (traditionalCommands !== undefined) {
		bot.removeListener('messageCreate', traditionalCommands);
		var reload = true;
	}
	delete require.cache[require.resolve('./commands/traditional.js')];
	traditionalCommands = require('./commands/traditional.js');
	bot.on('messageCreate', traditionalCommands);
	console.log(`✔ traditional commands file ${reload ? 'reloaded' : 'loaded'}: commands/traditional.js`);
}

bot.reloadMessageCreateEvent = () => { 
	if (onMessageCreate !== undefined) {
		bot.removeListener('messageCreate', onMessageCreate);
		var reload = true;
	}
	delete require.cache[require.resolve('./events/messageCreate.js')];
	onMessageCreate = require('./events/messageCreate.js');
	bot.on('messageCreate', onMessageCreate);
	console.log(`✔ messageCreate event ${reload ? 'reloaded' : 'loaded'}: events/messageCreate.js`);
}

bot.updateActivity = () => {
	const guildsCount = bot.guilds.cache.size;
	const totalMembersCount = bot.guilds.cache.reduce((accumulator, guild) => accumulator + guild.memberCount, 0);
//	const igLinksConvertedCount = await database.getIgLinksConvertedCount();
	bot.user.setActivity(`${guildsCount} servers | ${totalMembersCount} users`, { type: 'LISTENING' });
}

const loginToInstagram = async () => {
	try {
		await bot.ig.init({
			username: config.ig.login,
			password: config.ig.password
		});
		return true;
	} catch (error) {
		console.log(error);
		const embed = embeds.jsError('Instagram login error', error, true);
		bot.supportServer.channels.errors.send({ embeds: [embed] });
		return false;
	}
}

const appendDescriptionToEmbed = (message, newDescription) => {
	const embed = message.embeds[0];
	embed.setDescription(`${embed.description} \n ${newDescription}`);
	message.edit({ embeds: [embed] });
}

function loadEmojis() {
	bot.supportServer.emojis = {};
	bot.supportServer.guild.emojis.cache.forEach(emoji => {
		bot.supportServer.emojis[emoji.name] = emoji;
	});
	console.log(bot.supportServer.emojis);
}

bot.on('ready', async () => {
	console.log(bot);
	console.log(`${bot.user.username} started!`);
	const supportServer = bot.guilds.cache.get(config.supportServer.server);
	if (!supportServer) {
		console.log('✖ support server not found');
		bot.user.setActivity('CRITICAL ERROR SUPPORT_SERVER_MISSING', { type: 'WATCHING' });
		return false;
	}
	const supportServerData = {
		guild: supportServer,
		channels: {
			logs: supportServer.channels.cache.get(config.supportServer.channelsIds.logs),
			errors: supportServer.channels.cache.get(config.supportServer.channelsIds.errors),
			guildsErrors: supportServer.channels.cache.get(config.supportServer.channelsIds.guildsErrors),
			igLogs: supportServer.channels.cache.get(config.supportServer.channelsIds.igLogs),
		}
	}
	bot.supportServer = supportServerData;
	const startup = await bot.supportServer.channels.logs.send({ embeds: [embeds.basic('STARTUP', `Process started.\nGuilds count: ${bot.guilds.cache.size}`, config.colors.white)] });
	const loggedIn = await loginToInstagram();
	if (!loggedIn) {
		console.log(`✖ Couldn't login to Instagram`);
		const embed = embeds.error('Instagram', 'Couldn\'t login to Instagram.');
		bot.supportServer.channels.logs.send({ embeds: [embed]});
		bot.user.setActivity('CRITICAL ERROR INSTAGRAM_LOGIN_ERROR', { type: 'WATCHING' });
		return false;
	}
	console.log(`✔ Logged in to Instagram`);
	appendDescriptionToEmbed(startup, `\n✅ Logged in to Instagram`);
	bot.reloadTraditionalCommands();
	bot.reloadMessageCreateEvent();
/*	const DB = await database.createPool();
	if (!DB) {
		console.log('✖ Couldn\'t connect to MySQL');
		const embed = embeds.error('MySQL', 'Couldn't connect to database.');
		bot.supportServer.channels.logs.send({ embeds: [embed]});
		bot.user.setActivity('CRITICAL ERROR DATABASE_ERROR', { type: 'WATCHING' });
		return false;
	}
	console.log(`✔ Connected to MySQL`);
	appendDescriptionToEmbed(startup, `✅ Connected to MySQL`);
	*/
	bot.updateActivity();
	loadEmojis();

//	const media = await bot.ig.getMediaInfoFromURL('https://www.instagram.com/reel/CfKjgxmPfiR/?igshid=YmMyMTA2M2Y=');
//	console.log(media);

//	const media2 = await bot.ig.getMediaInfoFromURL('https://www.instagram.com/tv/CfYqjaylpH13S7S0w9xJspcNc2l2K-y0kH57gk0/?igshid=YmMyMTA2M2Y=').catch(error => console.log(error));
//	console.log(media2);
});

bot.on('guildCreate', async guild => {
	console.log(`✔ Bot has been added to new server: ${guild.name}`);
	const embed = await embeds.guildCreate(guild);
	bot.supportServer.channels.logs.send({ embeds: [embed] });
	updateActivity();
});

bot.on('guildDelete', async guild => {
	console.log(`✖ Bot has been kicked from serwer: ${guild.name}`);
	const embed = await embeds.guildDelete(guild);
	bot.supportServer.channels.logs.send({ embeds: [embed] });
	updateActivity();
});

bot.login(config.token);