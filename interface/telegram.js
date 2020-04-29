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

//////////////////////////// ADMIN AUTHORIZATION ///////////////////////////////

bot.onText(/\/admin/, async(msg) => {
    pattone = await mongo.GetPath(msg.chat.id)
    pattone = 10
    await mongo.UpdatePath(msg.chat.id, pattone)
    var admin = await mongo.GetAdmin(msg.chat.id)
    if (admin) {
        bot.sendMessage(msg.chat.id, "You're in!", {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'Insert New Image',
                        callback_data: 'ini'
                    }, {
                        text: 'Check Votes',
                        callback_data: 'cv'
                    }],
                    [{
                        text: 'Share Results',
                        callback_data: 'sr'
                    }]
                ]
            }
        })
    } else {
        bot.sendMessage(msg.chat.id, "You're not authorized!", {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'Add me to admin list',
                        callback_data: 'amtal'
                    }, {
                        text: 'Main Menu',
                        callback_data: 'mm'
                    }]
                ]
            }
        })

    }
});

bot.on('message', async(msg) => {
    var pw = "rat"
    if ((pattone == 10) && (msg.text.toString().includes(pw))) {
        await mongo.SetAdmin(msg.chat.id)
        bot.sendMessage(msg.chat.id, 'Now you are in Admin Mode!', {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'Insert New Image',
                        callback_data: 'ini'
                    }, {
                        text: 'Check Votes',
                        callback_data: 'cv'
                    }],
                    [{
                        text: 'Share Results',
                        callback_data: 'sr'
                    }]
                ]
            }
        })
    }

    // } else {
    //     bot.sendMessage(msg.chat.id, 'ERROR: Wrong Password!')
    //     bot.sendMessage(msg.chat.id, 'Insert Password')
    // }

})