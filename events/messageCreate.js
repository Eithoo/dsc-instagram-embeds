const config = require('../config.js');
const colors = config.colors;
const Discord = require('discord.js');
const embeds = require('../embeds.js');
const { inspect } = require('util');
const { hasAdminPermissions, getContentFromCodeBlock } = require('../utils.js');

function getMediaURL(data) {
	if (data.video_versions) return { type: 'video', url: data.video_versions[0].url };
	else if (data.image_versions2) return { type: 'image', url: data.image_versions2.candidates[0].url };
	return false;
}

async function execute(message) {
	const bot = message.client;
	if (message.author.bot) return;
	if (message.channel.type === 'DM') return;
	const instagramLinkRegex = /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)\/(.+)/im;
	const instagramLink = instagramLinkRegex.exec(message.content);
	if (!instagramLink) return;
	message.channel.sendTyping();
	const type = instagramLink[1];
	if (type == 'reel' || type == 'tv' || type == 'p') {
		// if p then only if video, photos are fine by default
		let data = await bot.ig.getMediaInfoFromURL(instagramLink[0]).catch(err => false);
		console.log(data);
		if (!data) return message.react('❌');
		data = data[0];
		const isVideo = data.media_type == 2;
		const isCarousel = data.media_type == 8;
		if (type == 'p' && !isVideo && !isCarousel) return; // embeds with photos are fine by default
		if (isCarousel) {
			// show only first  media and add reaction, when user clicks on it, it will show all media
			// MAYBE BUTTON INSTEAD OF REACTION?
			message.channel.send('carousel logic isnt fully implemented yet');
			const firstMedia = data.carousel_media[0];
			const media = getMediaURL(firstMedia);
			if (media.type == 'image') {
				const embed = embeds.mediaImage(data, media.url, bot);
				message.reply({ embeds: [embed] });
				message.suppressEmbeds(true);
			} else {
				message.channel.send('video logic isnt implemented yet');
			}
		} else {
			const media = getMediaURL(data);
			if (!media) return message.react('❌');
			if (media.type == 'image') {
				const embed = embeds.mediaImage(data, media.url, bot);
				message.reply({ embeds: [embed] });
				message.suppressEmbeds(true);
			} else {
				message.channel.send('video logic isnt implemented yet');
			}
		}
		////////////////
		/*const result = inspect(data).length > 1900 ? inspect(data).substring(0, 1900) + '...' : inspect(data);
		let evalEmbed = new Discord.MessageEmbed()
			.setAuthor({ name: 'raw data', iconURL: message.author.avatarURL() })
			.setColor(colors.blue)
			.setDescription(Discord.Formatters.codeBlock('js', result))
			.setTimestamp()
			.setFooter({ text: bot.user.username, iconURL: bot.user.avatarURL() });
		message.reply({ embeds: [evalEmbed] });*/
		////////////////
	//	message.channel.send(data[0].video_versions[0].url);
	}
}

module.exports = execute;