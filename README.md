# dsc-instagram-embeds
readme will be short because bot isn't finished - because it works only for a few hours and then instagram bans your account.    
you probably know how to install it: `npm install`, create file with name `config-secret.js` with following content (and fill it with your data):    
```js
module.exports = {
	token: 'your discord bot token',
	ig: {
		login: 'instagram login',
		password: 'instagram password'
	}
}
```
then `node main.js` to  run   
i stopped development of this bot because my instagram account for bot got banned and I think it might happen again so its a waste of time to create bot that will stop working after a few hours
