const Bot = require('node-telegram-bot-api');
const token = '835439392:AAFCgY6dwbc_YFXDJ7OaXckq6-JDM973NHE';
const axios = require('axios');
const mongo = require('./background/mongo')
var index = 0;
var pattone = 0;

const bot = new Bot(token, { polling: true });
console.log("BOT_ON")
mongo.Setup()

////////////////////////// START ////////////////////////////////////////////

bot.onText(/\/start/, async(msg) => {

    bot.sendMessage(msg.chat.id, "Welcome " + msg.from.first_name + "!", {
        "reply_markup": {
            inline_keyboard: [
                [{
                    text: 'Today Photos',
                    callback_data: 'tp'
                }, {
                    text: 'My Photos',
                    callback_data: 'mp'
                }]
            ]
        }
    });

});