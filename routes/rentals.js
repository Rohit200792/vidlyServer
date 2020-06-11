const express = require("express");
const mongoose = require("mongoose");
const Fawn = require("fawn"); //Promise based Library for transactions in MongoDB
const moment = require("moment");
const Joi = require("@hapi/joi").extend(require("@hapi/joi-date")); //Extensions for advance date rules

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const objectid = require("../middleware/objectid");

const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { User } = require("../models/user");

const router = express.Router();
Fawn.init(mongoose);

//create new rental
router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    const customer = await User.findById(req.body.customer);
    if (!customer) {
      return res.status(400).send("Customer is Invalid");
    }
    const movie = await Movie.findById(req.body.movie);
    if (!movie) {
      return res.status(400).send("Movie is Invalid");
    }
    if (movie.numberInStock === 0) {
      return res.status(400).send("Movie not in Stock");
    }
    let new_rental = new Rental(req.body);
    /*//Perform as a transaction using fawn
      new_rental = await new_rental.save();
      movie.numberInStock--;
      await movie.save();
      */
    new Fawn.Task()
      .save("rentals", new_rental) //Note: "rentals" collection name
      .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
      .run();
    return res.send(new_rental);
  }
});

//read all rentals by user
router.get("/me", auth, async (req, res) => {
  const rentals = await Rental.find({ customer: req.user.id })
    .populate("customer", ["id", "name", "email"])
    .populate("movie", ["id", "title", "genre"]);
  return res.send(rentals);
});

//read all rentals
router.get("/", [auth, admin], async (req, res) => {
  const rentals = await Rental.find()
    .populate("customer", ["id", "name", "email"])
    .populate("movie", ["id", "title", "genre"]);
  return res.send(rentals);
});

//read rental by id
router.get("/:id", [auth, admin, objectid], async (req, res) => {
  const rental = await Rental.findById(req.params.id)
    .populate("customer")
    .populate("movie");
  if (!rental) {
    return res.status(404).send("Data Not Found");
  } else {
    return res.send(rental);
  }
});

//update rental by id
router.put("/:id", [auth, admin, objectid], async (req, res) => {
  if (req.body.movie != undefined) {
    const movie = await Movie.findById(req.body.movie);
    if (!movie) {
      return res.status(400).send("Movie is Invalid");
    }
  }
  if (req.body.customer != undefined) {
    const customer = await User.findById(req.body.customer);
    if (!customer) {
      return res.status(400).send("User is Invalid");
    }
  }

  //Return a rented movie
  if (req.body.dateReturned != undefined) {
    const schema = Joi.object({
      dateReturned: Joi.date().format("YYYY-MM-DD"),
    });

    const { error } = schema.validate({ dateReturned: req.body.dateReturned });
    if (error) {
      return res
        .status(400)
        .send("invalid format for date returned. use YYYY-MM-DD");
    }
  }

  //Put values for movie and genre before calculating rental fee
  let rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: false,
  });

  if (!rental) {
    return res.status(404).send("Data Not Found");
  } else {
    //Return a rented movie
    if (req.body.dateReturned != undefined) {
      const movie = await Movie.findById(rental.movie);
      const days_rented =
        moment(req.body.dateReturned).diff(moment(rental.dateOut), "days") + 1;
      if (days_rented <= 0) {
        return res
          .status(400)
          .send("date returned must be greater than or equal to date out");
      }
      req.body.rentalFee = movie.dailyRentalRate * days_rented;
      rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        useFindAndModify: false,
      });
    }
    return res.send(rental);
  }
});

//delete rental by id
router.delete("/:id", [auth, admin, objectid], async (req, res) => {
  const rental = await Rental.findByIdAndRemove(req.params.id);
  if (!rental) {
    return res.status(404).send("Data not Send");
  } else {
    return res.send(rental);
  }
});

module.exports = router;
