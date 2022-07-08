const config = require('../config.js');
const colors = config.colors;
const Discord = require('discord.js');
const embeds = require('../embeds.js');
const { inspect } = require('util');
const { hasAdminPermissions, getContentFromCodeBlock } = require('../utils.js');


async function execute(message) {
	const bot = message.client;
	if (message.author.bot) return;
	const prefix = `<@!${bot.user.id}>`;
	const prefix2 = `<@${bot.user.id}>`;
	if (message.channel.type === 'DM') {
		const embed = embeds.error('oh no no', `bot wont work in DM lol\n\nidk use it if you want: ${config.supportServer.invite}`)
			.setImage('https://emoji.gg/assets/emoji/2446_cursed_flushed.png');
		return message.reply({ embeds: [embed] });
	}
	if (!message.content.startsWith(prefix) && !message.content.startsWith(prefix2)) return;
	let args;
	if (message.content.startsWith(prefix))
		args = message.content.slice(prefix.length).trim().split(/ |(```js\n)|(```\n)/g);
	else
		args = message.content.slice(prefix2.length).trim().split(/ |(```js\n)|(```\n)/g);
	args = args.filter(arg => arg != undefined);
	const originalCommand = args.shift();
	const command = originalCommand.toLowerCase().trim();
	switch (command) {
		case '':
		case 'help': {
			message.reply('help command will be there');
		break;
		}

		case 'test': {
			message.reply('dziala');
		break;
		}

		case 'reloadinteractions':
		case 'ri': {
			if (!hasAdminPermissions(message.member))
				return message.reply({ embeds: [embeds.noPermissions(originalCommand)] });
			const loaded = await bot.specialFunctions.sendCommandsToDiscord();
			console.log('✔ Komendy przeładowane.');
			let embed = embeds.commandsLoaded(loaded.global, loaded.supportServer)
				.setAuthor({ name: 'Discord Interactions', iconURL: config.embedImages.success })
				.setDescription('Zaktualizowano listę komend, załadowano ponownie pliki interakcji.');
			await message.reply({ embeds: [embed] });
			embed.setFooter({ text: `Wywołano przez: ${message.author.tag}`});
			bot.supportServer.channels.logs.send({ embeds: [embed] });
		break;
		}

		case 'reloadtraditional':
		case 'rt': {
			if (!hasAdminPermissions(message.member))
				return message.reply({ embeds: [embeds.noPermissions(originalCommand)] });
			bot.specialFunctions.loadTraditionalCommands();
			console.log('✔ Komendy tradycyjne przeładowane.');
			let embed = embeds.success('Komendy tradycyjne', 'Przeładowano moduł komend tradycyjnych (@bot komenda)');
			await message.reply({ embeds: [embed] });
			embed.setFooter({ text: `Wywołano przez: ${message.author.tag}`});
			bot.supportServer.channels.logs.send({ embeds: [embed] });
		break;
		}


		case 'eval': {
			if (!hasAdminPermissions(message.member))
				return message.reply({ embeds: [embeds.noPermissions(originalCommand)] });
			if (args.length == 0)
				return message.reply({ embeds: [embeds.syntaxError(originalCommand, '<code>')] });
			let evaled;
			try {
				const content = getContentFromCodeBlock(args.join(' '));
				if (content)
					evaled = await eval(`(async () => {${content}})()`);
				else
					evaled = await eval(`(async () => {${args.join(' ')}})()`);
				console.log(evaled);
				const result = inspect(evaled).length > 1900 ? inspect(evaled).substring(0, 1900) + '...' : inspect(evaled);
				let evalEmbed = new Discord.MessageEmbed()
					.setAuthor({ name: 'eval', iconURL: message.author.avatarURL() })
					.setColor(colors.blue)
					.setDescription(Discord.Formatters.codeBlock('js', result))
					.addField('code:', Discord.Formatters.codeBlock('js', content || args.join(' ')))
					.setTimestamp()
					.setFooter({ text: bot.user.username, iconURL: bot.user.avatarURL() });
				message.channel.send({ embeds: [evalEmbed] });
			}
			catch (error) {
				console.error('eval', error);
				let evalEmbed = new Discord.MessageEmbed()
					.setAuthor({ name: 'eval', iconURL: message.author.avatarURL() })
					.setColor(colors.orange)
					.setDescription(Discord.Formatters.codeBlock('js', error))
					.setTimestamp()
					.setFooter({ text: bot.user.username, iconURL: bot.user.avatarURL() });
				message.channel.send({ embeds: [evalEmbed] });
			}
		break;
		}

		case 'ping':
		case 'p':
			embeds.ping.firstCall(message).then(botmessage => {
				const embed = embeds.ping.result(message, botmessage);
				botmessage.edit({ embeds: [embed] });
			});
			message.channel.send('ta komenda jest do zmiany, obecny moduł wrzucony z poprzedniego bota')
		break;


	} // koniec switcha
}

module.exports = execute;