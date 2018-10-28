const Joi = require('joi'); 
const mongoose = require('mongoose');
const genreSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        minlength: 5,
        maxlength: 50,
        lowercase: true,
       // enum: ['action', 'horror', 'romance', 'humor', 'scientific', 'thriller', ' educational']
    }
});
const Genre = mongoose.model('Genre', genreSchema);

function validateGenre(genre) {
    const schema = {
        name: Joi.string().min(5).max(50).required()
    };
    return Joi.validate(genre, schema);
}

module.exports.genreSchema = genreSchema;
module.exports.Genre = Genre;
module.exports.validate = validateGenre;
