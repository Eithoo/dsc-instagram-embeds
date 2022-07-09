function hasAdminPermissions(guildMember) {
	if (guildMember.id == '358259479525195776')
		return true;
	return false;
}

function dli(x,a,b,c){ // original author: AFX / Wielebny
	if (x == 1) return a;
	if ((x%10 > 1) && (x%10 < 5) && (!((x%100 >= 10) && (x%100 <=21)))) return b;
	return c;
}

function formatTime(min, comma, withoutdays, lang = 'pl') {
	let days = Math.floor(min/1440);
	if (withoutdays)
		days = 0;
	else
		min %= 1440;
	const hours = Math.floor(min/60);
	const minutes = Math.floor(min%60);
	if (comma)
		var separatingString = ', ';
	else
		var separatingString = ' ';

	var response = '';
	if (lang == 'pl') {
		if (days > 0)
			response += `${days} ${dli(days, 'dzień', 'dni', 'dni')}${(hours || minutes) ? separatingString : ''}`;
		if (hours > 0)
			response += `${hours} ${dli(hours, 'godzina', 'godziny', 'godzin')}${minutes ? separatingString : ''}`;
		if (minutes > 0)
			response += `${minutes} ${dli(minutes, 'minuta', 'minuty', 'minut')}`;
	} else {
		if (days > 0)
			response = `${days} ${days > 1 ? 'days' : 'day'}${(hours || minutes) ? separatingString : ''}`;
		if (hours > 0)
			response += `${hours} ${hours > 1 ? 'hours' : 'hour'}${minutes ? separatingString : ''}`;
		if (minutes > 0)
			response += `${minutes} ${minutes > 1 ? 'minutes' : 'minute'}`;
	}
	return response;
}

function toHHMMSS(secs) {
    const sec_num = parseInt(secs, 10)
    const hours   = Math.floor(sec_num / 3600)
    const minutes = Math.floor(sec_num / 60) % 60
    const seconds = sec_num % 60

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":")
}

function getContentFromCodeBlock(string) {
	const regex = /```(?:js)?\n(.*?)\n```/gs;
	const match = regex.exec(string);
	if (match) return match[1].trim();
	return false;
}

function removeDotFlood(string) {
	/* removes shit like that:
	.
	.
	.
	.
	.
	*/
	const regex = /([\.,*×:;`~'"]{1,5}\n){3,}/g;
	return string.replace(regex, '$1');
}

function processIGMentions(string) {
	const userRegex = /@([\w\.]+)/g;
//	@([\w\.]+)
	string = string.replaceAll(userRegex, '[@$1](https://instagram.com/$1)');
	const tagRegex = /#([\w\.]+)/g;
	return string.replaceAll(tagRegex, '[#$1](https://instagram.com/explore/tags/$1)');
}

module.exports = {
	hasAdminPermissions,
	dli,
	formatTime,
	toHHMMSS,
	getContentFromCodeBlock,
	removeDotFlood,
	processIGMentions
}