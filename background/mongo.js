'use strict';
var mongoose = require('mongoose');
var fs = require('fs');

function Setup() {
    var connStr = 'mongodb+srv://FastidioCane:akamongodb@botester-ha78o.mongodb.net/test?retryWrites=true&w=majority';
    mongoose.connect(connStr, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
    var db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error:'))
}

var adminSchema = new mongoose.Schema({
    idAdmin: { type: Number, unique: true, required: true }
})

var adminModel = mongoose.model('admin', adminSchema, 'admins')

async function GetAdmin(id) {
    let admin = await adminModel.findOne({
        idAdmin: id
    }).lean()
    return admin
}

async function SetAdmin(id) {
    var x = new adminModel({
        idAdmin: id
    })
    await x.save();
}

///////////////////////////////////////////////////

var pathSchema = new mongoose.Schema({
    idUser: { type: Number, unique: true, required: true },
    idPath: { type: Number, unique: false, required: true }
})

var pathModel = mongoose.model('path', pathSchema, 'paths')

async function UpdatePath(id, level) {
    pathModel.findOneAndUpdate({
        idUser: id
    }, {
        $set: {
            idPath: level
        }
    }, {
        upsert: true,
        setDefaultsOnInsert: true
    }).exec()
}

async function GetPath(id) {

    let path = await pathModel.findOne({
        idUser: id
    }).lean()
    var ip = path.idPath
    return ip

}

////////////////////////////////////////////////////

var photoSchema = new mongoose.Schema({
    Username: { type: String, unique: false, required: true },
    idUser: { type: Number, unique: false, required: true },
    idPhoto: { type: String, unique: true, required: true },
    date: { type: Date, unique: false, required: true },
    like: { type: Number, unique: false, required: true },
    dislike: { type: Number, unique: false, required: true }
})

var photoModel = mongoose.model('photo', photoSchema, 'photos')

////////////////////////////////////////////////////////

async function PhotoUp(username, id, url, dt, lk, dlk) {
    var x = new photoModel({
        Username: username,
        idUser: id,
        idPhoto: url,
        date: dt,
        like: lk,
        dislike: dlk
    })
    await x.save();
}

module.exports = {

    photoModel: photoModel,
    adminModel: adminModel,
    pathModel: pathModel,

    Setup: Setup,
    GetAdmin: GetAdmin,
    SetAdmin: SetAdmin,
    UpdatePath: UpdatePath,
    PhotoUp: PhotoUp,
    getiPhotos: getiPhotos,
    getAutPhotos: getAutPhotos,
    countPhotos: countPhotos,
    UpdateLike: UpdateLike,
    UpdateDislike: UpdateDislike,
    getLikePhotos: getLikePhotos,
    getDislikePhotos: getDislikePhotos,
    GetPath: GetPath,
    PhotoDelete: PhotoDelete,
    CheckVotes: CheckVotes
}