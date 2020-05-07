process.env["NTBA_FIX_319"] = 1;

'use strict';
var mongoose = require('mongoose');
var fs = require('fs');

function Setup() {
    mongoose.connect(process.env.DB_KEY, {
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

async function PhotoDelete(id) {
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
//////////////////////////////////////////////////////////

async function getiPhotos() {

    var ip = await photoModel.find({}, {
        '_id': 0,
        'Username': 0,
        'idUser': 0,
        'like': 0,
        'dislike': 0,
        '__v': 0
    }).lean()

    return ip

}

async function getAutPhotos(ipp) {

    var aut = await photoModel.findOne({ idPhoto: ipp }, {
        '_id': 0,
        'idUser': 0,
        'idPhoto': 0,
        'like': 0,
        'dislike': 0,
        '__v': 0
    }).lean()
    var autname = aut.Username
    return autname
}

async function countPhotos() {
    var counter = await photoModel.countDocuments().lean()
    return counter
}


async function getLikePhotos(ipp) {

    var lk = await photoModel.findOne({ idPhoto: ipp }, {
        '_id': 0,
        'Username': 0,
        'date': 0,
        'idUser': 0,
        'idPhoto': 0,
        'dislike': 0,
        '__v': 0
    }).lean()

    return lk
}

async function getDislikePhotos(ipp) {

    var dlk = await photoModel.findOne({ idPhoto: ipp }, {
        '_id': 0,
        'Username': 0,
        'date': 0,
        'like': 0,
        'idUser': 0,
        'idPhoto': 0,
        '__v': 0
    }).lean()

    return dlk
}

async function UpdateLike(id, lk) {
    photoModel.findOneAndUpdate({
        idPhoto: id
    }, {
        $set: {
            like: lk,
        }
    }).exec()
}

async function UpdateDislike(id, dlk) {
    photoModel.findOneAndUpdate({
        idPhoto: id
    }, {
        $set: {
            dislike: dlk,
        }
    }).exec()
}

async function CheckVotes() {

    photoModel.find({}, {
            '_id': 0,
            'idUser': 0,
            'dislike': 0,
            'date': 0,
            '__v': 0
        },
        function(err, docs) {
            if (!err) {
                console.log(docs);
            } else {
                throw err;
            }
        }).sort({ like: -1 })
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