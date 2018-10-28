
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const Joi = require('joi'); 
//const PasswordComplexity = require('joi-password-complexity');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
        minlength: 5,
        maxlength: 50,
    },
    email: {
        type:String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    }, 
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
    }
    // roles: [] for more roles or operations: []
});

userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { _id: this._id, isAdmin: this.isAdmin}, 
        config.get('jwtPrivateKey')
    );
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required()
    };
    return Joi.validate(user, schema);
}

module.exports.User = User;
module.exports.validate = validateUser;