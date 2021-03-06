const express = require("express");
const mongoose = require("mongoose");
const { Movie, validate } = require("../models/movie");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const objectid = require("../middleware/objectid");
const { Genre } = require("../models/genre");

const router = express.Router();

//create new movie
router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message); //Bad Request
  }
  const genre = await Genre.findById(req.body.genre);
  if (!genre) {
    return res.status(400).send("Genre is Invalid");
  }
  let new_movie = new Movie(req.body);
  new_movie = await new_movie.save();
  return res.send(new_movie);
});

//read all movies
router.get("/", async (req, res) => {
  const movies = await Movie.find().populate("genre").sort("title");
  return res.send(movies);
});

//read movies by id
router.get("/:id", objectid, async (req, res) => {
  const movie = await Movie.findById(req.params.id).populate("genre");
  if (!movie) {
    return res.status(404).send("Data Not Found");
  } else {
    return res.send(movie);
  }
});

//update movies by id
router.put("/:id", [auth, admin, objectid], async (req, res, next) => {
  if (req.body.genre != undefined) {
    const genre = await Genre.findById(req.body.genre);
    if (!genre) {
      return res.status(400).send("Genre is Invalid");
    }
  }
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    useFindAndModify: false,
  });
  if (!movie) {
    return res.status(404).send("Data Not Found");
  } else {
    return res.send(movie);
  }
});

//delete movie by id
router.delete("/:id", [auth, admin, objectid], async (req, res, next) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie) {
    return res.status(404).send("Data Not Found");
  } else {
    return res.send(movie);
  }
});

module.exports = router;
