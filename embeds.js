const config = require('./config.js');
const colors = config.colors;
const Discord = require('discord.js');
const { formatTime, removeDotFlood, processIGMentions } = require('./utils.js');
const { inspect } = require('util');

let embeds = {};
embeds.basic = (title, content, color, authorimage) => {
	let embed = new Discord.MessageEmbed()
		.setColor(color || colors.blue)
		.setDescription(content)
	if (authorimage)
		embed.setAuthor({ name: title, iconURL: authorimage });
	else
		embed.setTitle(title);
	return embed;
}

embeds.error = (title, content, color) => {
	let embed = new Discord.MessageEmbed()
		.setColor(color || colors.red)
		.setAuthor({ name: title, iconURL: config.embedImages.error })
		.setDescription(content);
	return embed;
}

embeds.success = (title, content, color) => {
	let embed = new Discord.MessageEmbed()
		.setColor(color || colors.green)
		.setAuthor({ name: title, iconURL: config.embedImages.success })
		.setDescription(content);
	return embed;
}

embeds.question = (title, content, color, icon = 'orange') => {
	let embed = new Discord.MessageEmbed()
		.setColor(color || colors.yellow)
		.setAuthor({ name: title, iconURL: icon == 'orange' ? config.embedImages.questionOrange : config.embedImages.questionBlue })
		.setDescription(content);
	return embed;
}

embeds.noPermissions = (command, args) => {
	let embed = new Discord.MessageEmbed()
		.setColor(colors.red)
		.setAuthor({ name: 'No permissions', iconURL: config.embedImages.error })
		.setDescription(`You don't have permissions to execute command \`${command}${args ? ' ' + args : ''}\`.`)
		.setTimestamp()
	return embed;
}

embeds.syntaxError = (command, ...usage) => {
	const usageArr = usage.map(elem => `${config.prefix}${command} \`${elem}\``);
	let embed = new Discord.MessageEmbed()
		.setColor(colors.red)
		.setAuthor({ name: 'Syntax error', iconURL: config.embedImages.error })
		.setDescription(`Command syntax: \n${usageArr.join('\n')}`)
		.setTimestamp();
	return embed;
}

embeds.guildCreate = async (guild,) => {
	const owner = await guild.fetchOwner();
	let embed = new Discord.MessageEmbed()
		.setColor(colors.green2)
		.setAuthor({ name: 'Nowy serwer', iconURL: config.embedImages.success })

		.addField('**Nazwa serwera**', guild.name, true)
		.addField('**ID**', guild.id, true)
		.addField('**Data utworzenia serwera**', Discord.Formatters.time(guild.createdAt, 'f'), true)

		.addField('**Poziom**', guild.premiumTier, true)
		.addField('**Język**', guild.preferredLocale, true)
		.addField('**Liczba użytkowników**', guild.memberCount.toString(), true)

		.addField('**Właściciel serwera**', `${owner} (${owner.user.tag}) (${owner.id})`)
		.addField('**Opis serwera**', guild.description || 'nie podano')

		.setImage(guild.iconURL({ dynamic: true, size: 4096 }))
		.setTimestamp();
	return embed;
}

embeds.guildDelete = async guild => {
	let embed = new Discord.MessageEmbed()
		.setColor(colors.paleRed)
		.setAuthor({ name: 'Usunięto bota z serwera', iconURL: config.embedImages.error })

		.addField('**Nazwa serwera**', guild.name, true)
		.addField('**ID**', guild.id, true)
		.addField('**Data utworzenia serwera**', Discord.Formatters.time(guild.createdAt, 'f'), true)

		.addField('**Poziom**', guild.premiumTier, true)
		.addField('**Język**', guild.preferredLocale, true)
		.addField('**Liczba użytkowników**', guild.memberCount.toString(), true)

		.addField('**Data dołączenia bota na serwer**', Discord.Formatters.time(guild.jointedAt, 'f'))
		.addField('**Właściciel serwera**', `<@${guild.ownerId}> (${guild.ownerId})`)
		.addField('**Opis serwera**', guild.description || 'nie podano')

		.setImage(guild.iconURL({ dynamic: true, size: 4096 }))
		.setTimestamp();
	return embed;
}

embeds.noServerPermissions = (guild, permission) => {
	let embed = new Discord.MessageEmbed()
		.setColor(colors.paleRed)
		.setAuthor({ name: 'Brak uprawnień', iconURL: config.embedImages.error })
		.addField('**Nazwa serwera**', guild.name, true)
		.addField('**ID**', guild.id, true)
		.addField('**Brakujące uprawnienie**', permission);
	return embed;
}

embeds.jsError = (title = 'error', error, full) => {
	if (full) { // nie pokazujemy całego błędu zwykłemu użytkownikowi
		error = inspect(error);
		if (error.length > 3700)
			error = error.substr(0, 3700) + '...\n\n...wiadomość przekroczyła maksymalną ilość znaków i została ucięta...'
	}
	let embed = new Discord.MessageEmbed()
		.setAuthor({ name: title, iconURL: config.embedImages.error })
		.setTitle('Error')
		.setColor(colors.paleRed)
		.setDescription(`${Discord.Formatters.codeBlock('js', error)}${!full ? '\nFull error was sent to Support server.' : ''}`)
		.setTimestamp()
	return embed;
}

embeds.mediaImage = (data, url, bot) => {
	let desc = '';
	if (data.like_count) desc += `${bot.supportServer.emojis.heartbeat} **${data.like_count.toLocaleString('fr')}**\n`;
	if (data.comment_count) desc += `${bot.supportServer.emojis.ig_comment} **${data.comment_count.toLocaleString('fr')}**\n`;
	if ((data.like_count || data.comment_count) && data.caption.text) desc += '-----------------------------------\n';
	if (data.caption.text) desc += processIGMentions(removeDotFlood(data.caption.text));
	let embed = new Discord.MessageEmbed()
		.setColor(colors.blue)
		.setAuthor({ name: data.user.full_name, iconURL: data.user.profile_pic_url, url: 'https://www.instagram.com/'+data.user.username })
		.setDescription(desc)
		.setImage(url)
		.setTimestamp(data.taken_at*1000)
		.setFooter({ text: bot.user.username, iconURL: bot.user.avatarURL() });
	return embed;
}

embeds.ping = {};
embeds.ping.firstCall = async message => {
	if (!message) return false;
	return await message.reply({ embeds: [embeds.basic('Ping', ':clock3: Trwa sprawdzanie pingu...', colors.white, config.embedImages.hourGlass)] });
}

embeds.ping.result = (userMessage, botMessage) => {
	if (!userMessage || !botMessage) return false;
	const bot = userMessage.client;
	let embed = botMessage.embeds[0];
	embed.setColor(colors.blue);
	embed.setDescription('Pomyślnie sprawdzono ping');
	embed.addField(':desktop: Ty ➦ Discord ➦ Bot', botMessage.createdAt - userMessage.createdAt + ' ms', true);
	embed.addField(':gear: Bot ➦ Discord', Math.round(bot.ws.ping) + ' ms', true);
	embed.addField(':hourglass: Uptime', formatTime(Math.ceil(bot.uptime / 60000), true));
	const currentRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
	const totalRAM = 2048;
	embed.addField(':file_cabinet: RAM', `${currentRAM} MB`, true);
	return embed;
}

module.exports = embeds;