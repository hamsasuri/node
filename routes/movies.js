const auth = require('../middleware/auth');
const {Rental, validate} = require('../models/movie');
const {Genre} = require('../models/genre'); // note: no validation here 
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req,res) => {
    const movies = await Rental.find().sort('title');
    res.send(movies);
});

router.get('/:id', async (req, res)=>{
    const movie = await Rental.findById(req.params.id);
    if (!movie) return res.status(404).send(`The movie with ID ${req.params.id} was not found!`);
    res.send(movie);
});

router.post('/', auth, async (req,res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

        // get genre from req.body and make sure it is a valid genre
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send('Invalid Genre ID');

    const movie = new Rental({ 
        title: req.body.title,
        genre: {    // only use the properties that need to be embedded
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    try { 
        await movie.save(); 
        console.log(movie); 
    } catch(ex) { 
        console.log(ex.message); 
    }
    res.send(movie);
});

router.put('/:id', auth, async (req,res) => {
    const {error} = validate(req.body); // result.error
    if (error)  return res.status(400).send(error.details[0].message);

        // get genre from req.body and make sure it is a valid genre
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) res.status(400).send(`Invalid Genre ID ${req.body.genreId}`)

    try {
        const movie = await Rental.findByIdAndUpdate(
            req.params.id, 
            {   title: req.body.title,
                genre: {
                    _id: genre._id,
                    name: genre.name
                },
                numberInStock: req.body.numberInStock,
                dailyRentalRate: req.body.dailyRentalRate
             },
            { new: true }
        );
        if (!movie) return res.status(404).send(`The movie with ID ${req.params.id} was not found`);    
        res.send(movie);
    }
    catch(ex) {
        console.log('Error: ', ex.message);
    }
});

router.delete('/:id', auth, async (req,res) => {
    const movie = await Rental.findByIdAndRemove(req.params.id);
    if (!movie) return res.status(404).send(`The movie with ID ${req.params.id} was not found`);
    res.send(movie);
});

module.exports = router;