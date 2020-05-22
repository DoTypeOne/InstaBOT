process.env["NTBA_FIX_319"] = 1;

const Bot = require('node-telegram-bot-api');
const axios = require('axios');
const mongo = require('./../background/mongo')
const emoji = require('node-emoji')
require('dotenv').config();

var index = 0;
var userpath = 0;

const bot = new Bot(process.env.BOT_TOKEN, { polling: true });
console.log("BOT_ON ")
mongo.Setup()

////////////////////////// START ////////////////////////////////////////////

bot.onText(/\/start/, async(msg) => {

    await mongo.UpdatePath(msg.chat.id, userpath)
    bot.sendMessage(msg.chat.id, "Welcome " + msg.from.first_name + "!", {
        "reply_markup": {
            inline_keyboard: [
                [{
                    text: 'Today Photos ' + emoji.get('camera'),
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
    userpath = await mongo.GetPath(msg.chat.id)
    userpath = 10
    await mongo.UpdatePath(msg.chat.id, userpath)
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
                        text: 'Main Menu ' + emoji.get('house'),
                        callback_data: 'mm'
                    }]
                ]
            }
        })

    }
});

bot.on('message', async(msg) => {
    var pw = "rat"
    if ((userpath == 10) && (msg.text.toString().includes(pw))) {
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
            userpath = await mongo.GetPath(msg.chat.id);
            userpath = 3;
            mongo.UpdatePath(msg.chat.id, userpath);
            break;

        case "cv":
            userpath = await mongo.GetPath(msg.chat.id)
            userpath = 11
            mongo.UpdatePath(msg.chat.id, userpath);
            await mongo.CheckVotes()
                //console.log(await mongo.CheckVotes())
            break;

        case "mm":
            bot.sendMessage(msg.chat.id, 'Main Menu ' + emoji.get('house'), {
                "reply_markup": {
                    inline_keyboard: [
                        [{
                            text: 'Today Photos ' + emoji.get('camera'),
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
            userpath = await mongo.GetPath(msg.chat.id)
            userpath = 10;
            mongo.UpdatePath(msg.chat.id, userpath);
            bot.sendMessage(msg.chat.id, "Insert Password")
            break;

        case "tp":
            userpath = await mongo.GetPath(msg.chat.id)
            userpath = 1;
            mongo.UpdatePath(msg.chat.id, userpath);
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
                                text: 'Dislike ' + emoji.get('-1'),
                                callback_data: 'dlk'
                            }, {
                                text: 'Like ' + emoji.get('+1'),
                                callback_data: 'lk'
                            }],
                            [{
                                text: 'Prev ' + emoji.get('arrow_left'),
                                callback_data: 'pv'
                            }, {
                                text: 'Next ' + emoji.get('arrow_right'),
                                callback_data: 'nx'
                            }],
                            [{
                                text: 'Main Menu ' + emoji.get('house'),
                                callback_data: 'mm'
                            }]
                        ]
                    }
                });
            } else {
                bot.sendMessage(msg.chat.id, "No photos for today")
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
            prevPhoto(mci)
            break;

        case "lk":
            bot.sendMessage(msg.chat.id, "Like!")
            var objid = await mongo.getiPhotos()
            var ip = []
            ip[index] = objid[index].idPhoto;
            var getlike = await mongo.getLikePhotos(ip[index])
            var like = getlike.like;
            like++;
            mongo.UpdateLike(ip[index], like);

            break;

        case "dlk":
            bot.sendMessage(msg.chat.id, "Dislike")
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
                                text: 'Upload Photo ' + emoji.get('arrow_double_up'),
                                callback_data: 'up'
                            },
                            {
                                text: 'WIP',
                                callback_data: 'wip'
                            }
                        ],
                        [{
                            text: 'Main Menu ' + emoji.get('house'),
                            callback_data: 'mm'
                        }]
                    ]
                }
            });

            break;

        case "up":
            bot.sendMessage(msg.chat.id, "Send photo that u want to upload");
            userpath = await mongo.GetPath(msg.chat.id);
            userpath = 3;
            mongo.UpdatePath(msg.chat.id, userpath);
            break;

        case "dp":
            bot.sendMessage(msg.chat.id, "Send photo that u want to delete");
            userpath = 4;
            mongo.UpdatePath(msg.chat.id, userpath);
            break;

        case "wip":
            bot.sendMessage(msg.chat.id, "Work in progress section");
            break;
        default:

            break;
    }
});

bot.on("polling_error", (err) => console.log(err))

///////////////////////////// PHOTO UPLOADER FUNCTION ///////////////////////////////////
bot.on('message', async(msg) => {

    var path = "images";
    var fileId;
    var filePath;

    var like = 0;
    var dislike = 0;
    userpath = await mongo.GetPath(msg.chat.id)

    if ((userpath == 3) && (msg.photo == undefined)) {
        bot.sendMessage(msg.chat.id, "Upload Error")
        bot.sendMessage(msg.chat.id, "Send photo that u want to upload");
    } else {
        fileId = msg.photo[msg.photo.length - 1].file_id;
        axios.get("https://api.telegram.org/bot" + process.env.BOT_TOKEN + "/getFile?file_id=" + fileId)
            .then(response => {

                infoFile = response.data
                filePath = response.data.result.file_path
                var url = "https://api.telegram.org/file/bot" + process.env.BOT_TOKEN + "/" + filePath;

                //Download image that user sends to the bot
                var download = require('download-file');
                var options = {
                    directory: path,
                    filename: fileId + ".jpg"
                }

                download(url, options, function(err) {
                    if (err) throw err
                        //console.log("Download successful!")
                    bot.sendMessage(msg.chat.id, "Uploaded correctly")
                    bot.sendMessage(msg.chat.id, "User Section", {
                        reply_markup: {
                            inline_keyboard: [
                                [{
                                        text: 'Upload Photo ' + emoji.get('arrow_double_up'),
                                        callback_data: 'up'
                                    },
                                    {
                                        text: 'WIP',
                                        callback_data: 'wip'
                                    }
                                ],
                                [{
                                    text: 'Main Menu ' + emoji.get('house'),
                                    callback_data: 'mm'
                                }]
                            ]
                        }
                    });
                })
                var date_ob = new Date().toLocaleString('it-ITA', {
                    timeZone: 'Europe/Rome'
                });

                mongo.PhotoUp(msg.from.first_name, msg.chat.id, fileId, date_ob, like, dislike)
                userpath = 0;
            })
            .catch(error => {
                console.log(error);
            });
    }
})


///////////////////////////// PHOTO DELETER FUNCTION ///////////////////////////////////
bot.on('message', (msg) => {

    var path = "images";
    var fileId;
    var infoFile;
    var filePath;


    var like = 0;
    var dislike = 0;

    if (userpath == 4) {
        fileId = msg.photo[msg.photo.length - 1].file_id;
        axios.get("https://api.telegram.org/bot" + process.env.BOT_TOKEN + "/getFile?file_id=" + fileId)
            .then(response => {

                infoFile = response.data
                filePath = response.data.result.file_path
                var url = "https://api.telegram.org/file/bot" + process.env.BOT_TOKEN + "/" + filePath;

                //Download image that user sends to the bot
                var download = require('download-file');
                var options = {
                    directory: path,
                    filename: fileId + ".jpg"
                }

                download(url, options, function(err) {
                    if (err) throw err
                    console.log("Download successful!");

                })
                var date_ob = new Date().toLocaleString('it-ITA', {
                    timeZone: 'Europe/Rome'
                });

                mongo.PhotoUp(msg.from.first_name, msg.chat.id, fileId, date_ob, like, dislike)
                userpath = 0;
            })
            .catch(error => {
                console.log(error);
            });
    }
});

///////////////////////////// NEXT PHOTO FUNCTION ///////////////////////////////////

async function nextPhoto(mci, counter) {

    var x = await mongo.getiPhotos()
    var ip = []
    if (index == counter) {
        bot.sendMessage(mci, "No more photos to watch!")
    } else {
        ip[index] = x[index].idPhoto;

        bot.sendPhoto(mci, ip[index])

        bot.sendMessage(mci, "Author: " + await mongo.getAutPhotos(ip[index]), {
            "reply_markup": {
                inline_keyboard: [
                    [{
                        text: 'Dislike ' + emoji.get('-1'),
                        callback_data: 'dlk'
                    }, {
                        text: 'Like ' + emoji.get('+1'),
                        callback_data: 'lk'
                    }],
                    [{
                        text: 'Prev ' + emoji.get('arrow_left'),
                        callback_data: 'pv'
                    }, {
                        text: 'Next ' + emoji.get('arrow_right'),
                        callback_data: 'nx'
                    }],
                    [{
                        text: 'Main Menu ' + emoji.get('house'),
                        callback_data: 'mm'
                    }]
                ]
            }
        });
        index++
    }


}

///////////////////////////// PREV PHOTO FUNCTION ///////////////////////////////////
async function prevPhoto(mci) {

    var x = await mongo.getiPhotos()
    var ip = []
    if (index == 0) {

        bot.sendMessage(mci, "There aren't new photos!")

    } else {
        index--
        ip[index] = x[index].idPhoto;
        bot.sendPhoto(mci, ip[index])

        bot.sendMessage(mci, "By " + await mongo.getAutPhotos(ip[index]), {
            "reply_markup": {
                inline_keyboard: [
                    [{
                        text: 'Dislike ' + emoji.get('-1'),
                        callback_data: 'dlk'
                    }, {
                        text: 'Like ' + emoji.get('+1'),
                        callback_data: 'lk'
                    }],
                    [{
                        text: 'Prev ' + emoji.get('arrow_left'),
                        callback_data: 'pv'
                    }, {
                        text: 'Next ' + emoji.get('arrow_right'),
                        callback_data: 'nx'
                    }],
                    [{
                        text: 'Main Menu ' + emoji.get('house'),
                        callback_data: 'mm'
                    }]
                ]
            }
        });

    }


}