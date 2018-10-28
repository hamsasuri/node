const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
    const db = config.get('db', { useNewUrlParser: true } );
//    mongoose.connect(db, { useNewUrlParser: true })
//        .then(()=>winston.info(`Connected to MongoDB: ${db}...`));
    mongoose.connect(db)
        .then(()=>winston.info(`Connected to MongoDB: ${db}...`));
}
