const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Genre, validate } = require("../models/genre");

const router = express.Router();

//create new genre
router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message); //Bad Request
  } else {
    let new_genre = new Genre(req.body);
    try {
      new_genre = await new_genre.save();
      return res.send(new_genre);
    } catch (err) {
      return res.status(500).send(err.message); //Internal Server Error
    }
  }
});

//read all genres
router.get("/", async (req, res) => {
  try {
    const genres = await Genre.find().sort("name");
    return res.send(genres);
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//read genres by id
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(genre);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//update genres by id
router.put("/:id", [auth, admin], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, useFindAndModify: false }
    );
    if (!genre) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(genre);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//delete genre by id
router.delete("/:id", [auth, admin], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(genre);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

module.exports = router;
