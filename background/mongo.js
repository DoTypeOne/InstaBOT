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