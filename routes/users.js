const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash'); // underscore optimized
const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/me', auth, async(req,res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req,res) => {
        // check validity of username and password etc.
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

        // check if user already registered
    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send('User already registered');

    /*
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });*/
    user = new User(_.pick(req.body, ['name','email','password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save(); 

    //console.log(user); 

        // send auth token in the response header
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
        // Pick using lodash
//    res.send(_.pick(user, ['_id', 'name', 'email']));

        // Or pick manually like this:
    // res.send({
    //     name: user.name,
    //     email: user.email
    // }) 
    // res.send(user);

});

module.exports = router;