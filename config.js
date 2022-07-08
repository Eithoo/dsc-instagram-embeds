const secret = require('./config-secret.js');
const config = {
	...secret,
	rate_limit: 10, // per 3 minutes
	rate_limit_under_attack: 1, // per 3 minutes
	colors: {
		blue: '#1E90FF',
		green: '#32CD32',
		green2: '#369078',
		orange: '#C75C22',
		orange2: '#FF5700',
		red: '#C72222',
		paleRed: '#CD5C5C',
		white: '#FFFFFE',
		yellow: '#FFFF00',
		discord: '#2f3136'
	},
	embedImages: {
		success: 'https://i.imgur.com/ATS5JiO.png',
		error: 'https://i.imgur.com/Q4sN7mB.png',
		hourGlass: 'https://i.imgur.com/RAmE2kg.png',
		questionOrange: 'https://i.imgur.com/MKLEdVO.png',
		questionBlue: 'https://i.imgur.com/7sn8t99.png',
		pollGif: 'https://i.imgur.com/vZRvG5N.gif'
	},
	supportServer: {
		server: '994411826777444402',
		channelsIds: {
			logs: '994413782975664220',
			guildsErrors: '994413955646754966',
			errors: '994413862864564334',
			igLogs: '994414082625126400'
		},
		invite: 'https://discord.gg/jFTDd63TS2'
	}
}

module.exports = config;