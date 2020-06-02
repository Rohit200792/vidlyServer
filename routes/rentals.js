const express = require("express");
const mongoose = require("mongoose");
const Fawn = require("fawn");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
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
    try {
      let new_rental = new Rental(req.body);
      /*//Perform as a transaction using fawn
      new_rental = await new_rental.save();
      movie.numberInStock--;
      await movie.save();
      */

      try {
        new Fawn.Task()
          .save("rentals", new_rental) //Note: "rentals" collection name
          .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
          .run();
        return res.send(new_rental);
      } catch (err) {
        return res.status(500).send(err.message); //Internal Server Errors
      }
    } catch (err) {
      return res.status(500).send(err.message); //Internal Server Error
    }
  }
});

//read all rentals
router.get("/me", auth, async (req, res) => {
  try {
    const rentals = await Rental.find({ customer: req.user.id })
      .populate("customer", ["id", "name", "email"])
      .populate("movie", ["id", "title", "genre"]);
    return res.send(rentals);
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//read all rentals
router.get("/", [auth, admin], async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("customer", ["id", "name", "email"])
      .populate("movie", ["id", "title", "genre"]);
    return res.send(rentals);
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//read rental by id
router.get("/:id", [auth, admin], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const rental = await Rental.findById(req.params.id)
      .populate("customer")
      .populate("movie");
    if (!rental) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(rental);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//update rental by id
router.put("/:id", [auth, admin], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
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
  try {
    let rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      useFindAndModify: false,
    });
    if (!rental) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(rental);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//delete rental by id
router.delete("/:id", [auth, admin], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const rental = await Rental.findByIdAndRemove(req.params.id);
    if (!rental) {
      return res.status(404).send("Data not Send");
    } else {
      return res.send(rental);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

module.exports = router;
