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

    await mongo.UpdatePath(msg.chat.id, pattone)
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

///////////////////////////// CALLBACK QUERY ///////////////////////////////

bot.on('callback_query', async function onCallbackQuery(admin) {
    const action = admin.data
    const msg = admin.message
    var mci = msg.chat.id

    switch (action) {

        case "ini":
            bot.sendMessage(msg.chat.id, "Send photo that u want to upload");
            pattone = await mongo.GetPath(msg.chat.id);
            pattone = 3;
            mongo.UpdatePath(msg.chat.id, pattone);
            break;

        case "cv":
            pattone = await mongo.GetPath(msg.chat.id)
            pattone = 11
            mongo.UpdatePath(msg.chat.id, pattone);
            await mongo.CheckVotes()

            break;

        case "mm":
            bot.sendMessage(msg.chat.id, "Main Menu", {
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
            break;

        case "amtal":
            pattone = await mongo.GetPath(msg.chat.id)
            pattone = 10;
            mongo.UpdatePath(msg.chat.id, pattone);
            bot.sendMessage(msg.chat.id, "Insert Password")
            break;

        case "tp":
            pattone = await mongo.GetPath(msg.chat.id)
            pattone = 1;
            mongo.UpdatePath(msg.chat.id, pattone);
            if (await mongo.countPhotos() > 0) {
                var objid = await mongo.getiPhotos()
                var ip = []
                index = 0
                ip[index] = objid[index].idPhoto;
                bot.sendPhoto(msg.chat.id, ip[index])

                bot.sendMessage(msg.chat.id, "Author: " + await mongo.getAutPhotos(ip[index]), {
                    "reply_markup": {
                        inline_keyboard: [
                            [{
                                text: 'Dislike',
                                callback_data: 'dlk'
                            }, {
                                text: 'Like',
                                callback_data: 'lk'
                            }],
                            [{
                                text: 'Prev',
                                callback_data: 'pv'
                            }, {
                                text: 'Next',
                                callback_data: 'nx'
                            }],
                            [{
                                text: 'Main Menu',
                                callback_data: 'mm'
                            }]
                        ]
                    }
                });
            } else {
                bot.sendMessage(msg.chat.id, "NO")
            }
            break;

        case "nx":
            //Richiamo il metodo per far apparire l'immagine successiva tramite il DB
            //Se ultima avviso l'utente
            var counter = await mongo.countPhotos()
            nextPhoto(mci, counter)
            break;

        case "pv":

            //richiamo il metodo per far apparire l'immagine precedente tramite il DB
            //Se prima avvisa l'utente

            var counter = await mongo.countPhotos()
            prevPhoto(mci, counter)
            break;
        case "lk":

            var objid = await mongo.getiPhotos()
            var ip = []
            ip[index] = objid[index].idPhoto;
            var getlike = await mongo.getLikePhotos(ip[index])
            var like = getlike.like;
            like++;
            mongo.UpdateLike(ip[index], like);

            break;

        case "dlk":
            var objid = await mongo.getiPhotos()
            var ip = []
            ip[index] = objid[index].idPhoto;
            var getdislike = await mongo.getDislikePhotos(ip[index]);
            var dislike = getdislike.dislike;
            dislike++;
            mongo.UpdateDislike(ip[index], dislike);
            break;

        case "mp":
            bot.sendMessage(msg.chat.id, "User Section", {
                reply_markup: {
                    inline_keyboard: [
                        [{
                                text: 'Upload Photo',
                                callback_data: 'up'
                            },
                            {
                                text: 'Delete Photo',
                                callback_data: 'dp'
                            }
                        ],
                        [{
                            text: 'Main Menu',
                            callback_data: 'mm'
                        }]
                    ]
                }

            });

            break;

        case "up":
            bot.sendMessage(msg.chat.id, "Send photo that u want to upload");
            pattone = await mongo.GetPath(msg.chat.id);
            pattone = 3;
            mongo.UpdatePath(msg.chat.id, pattone);
            break;

        case "dp":
            bot.sendMessage(msg.chat.id, "Send photo that u want to delete");
            pattone = 4;
            mongo.UpdatePath(msg.chat.id, pattone);
            break;

        default:

            break;
    }
})


///////////////////////////// NEXT PHOTO FUNCTION ///////////////////////////////////

async function nextPhoto(mci, counter) {

    var x = await mongo.getiPhotos()
    var ip = []
    if (index < counter) {
        index++
        ip[index] = x[index].idPhoto;
        bot.sendPhoto(mci, ip[index])

        bot.sendMessage(mci, "Author: " + await mongo.getAutPhotos(ip[index]), {
            "reply_markup": {
                inline_keyboard: [
                    [{
                        text: 'Dislike',
                        callback_data: 'dlk'
                    }, {
                        text: 'Like',
                        callback_data: 'lk'
                    }],
                    [{
                        text: 'Prev',
                        callback_data: 'pv'
                    }, {
                        text: 'Next',
                        callback_data: 'nx'
                    }],
                    [{
                        text: 'Main Menu',
                        callback_data: 'mm'
                    }]
                ]
            }
        });

    } else {
        bot.sendMessage(mci, "No more photos to watch!")
    }


}

///////////////////////////// PREV PHOTO FUNCTION ///////////////////////////////////
async function prevPhoto(mci, counter) {

    var x = await mongo.getiPhotos()
    var ip = []
    if (index == counter) {

        bot.sendMessage(mci, "There aren't new photos!")

    } else {
        index--
        ip[index] = x[index].idPhoto;
        bot.sendPhoto(mci, ip[index])

        bot.sendMessage(mci, "By " + await mongo.getAutPhotos(ip[index]), {
            "reply_markup": {
                inline_keyboard: [
                    [{
                        text: 'Dislike',
                        callback_data: 'dlk'
                    }, {
                        text: 'Like',
                        callback_data: 'lk'
                    }],
                    [{
                        text: 'Prev',
                        callback_data: 'pv'
                    }, {
                        text: 'Next',
                        callback_data: 'nx'
                    }],
                    [{
                        text: 'Main Menu',
                        callback_data: 'mm'
                    }]
                ]
            }
        });

    }


}