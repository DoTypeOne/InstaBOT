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