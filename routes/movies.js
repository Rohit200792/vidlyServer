const express = require("express");
const mongoose = require("mongoose");
const { Movie, validate } = require("../models/movie");
const { Genre } = require("../models/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

//create new movie
router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message); //Bad Request
  } else {
    try {
      const genre = await Genre.findById(req.body.genre);
      if (!genre) {
        return res.status(400).send("Genre is Invalid");
      }
      try {
        let new_movie = new Movie(req.body);
        new_movie = await new_movie.save();
        return res.send(new_movie);
      } catch (err) {
        return res.status(500).send(err.message); //Internal Server Error
      }
    } catch (err) {
      return res.status(500).send(err.message); //Internal Server Error
    }
  }
});

//read all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find().populate("genre").sort("title");
    return res.send(movies);
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//read movies by id
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const movie = await Movie.findById(req.params.id).populate("genre");
    if (!movie) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(movie);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//update movies by id
router.put("/:id", [auth, admin], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    if (req.body.genre != undefined) {
      const genre = await Genre.findById(req.body.genre);
      if (!genre) {
        return res.status(400).send("Genre is Invalid");
      }
    }
    try {
      const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        useFindAndModify: false,
      });
      if (!movie) {
        return res.status(404).send("Data Not Found");
      } else {
        return res.send(movie);
      }
    } catch (err) {
      return res.status(500).send(err.message); //Internal Server Error
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//delete movie by id
router.delete("/:id", [auth, admin], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const movie = await Movie.findByIdAndRemove(req.params.id);
    if (!movie) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(movie);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

module.exports = router;
