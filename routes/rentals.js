const auth = require('../middleware/auth');
const {Rental, validate} = require('../models/rental');
const {Movie} = require('../models/movie'); 
const {Customer} = require('../models/customer'); 
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req,res) => {
    const rentals = await Rental.find().sort('-dateOut');
    res.send(rentals);
});

router.get('/:id', async (req, res)=>{
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).send(`The rental with ID ${req.params.id} was not found!`);
    res.send(rental);
});

router.post('/', auth, async (req,res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid Customer ID');

    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid Movie ID');

    if (movie.numberInStock === 0) return res.status(400).send('Movie is out of stock');

    const rental = new Rental({ 
        customer: {    // only use the properties that need to be embedded
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie: {    // only use the properties that need to be embedded
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });

    // await rental.save(); 
    // movie.numberInStock--;
    // await movie.save();
    // console.log(movie); 
    // res.send(rental);

    try { 
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', 
                { _id: movie._id},
                { $inc: { numberInStock: -1 }
            })
            .run();
        res.send(rental);
        console.log(rental); 
        console.log(movie);
    } catch(ex) { 
        console.log(ex.message); 
        res.status(500).send('Something failed.');
    }
});


router.delete('/:id', auth, async (req,res) => {
    const rental = await Rental.findByIdAndRemove(req.params.id);
    if (!rental) return res.status(404).send(`The rental with ID ${req.params.id} was not found`);
    res.send(rental);
});

module.exports = router;