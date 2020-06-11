const express = require("express");
const mongoose = require("mongoose");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const objectid = require("../middleware/objectid");
const asyncMiddleware = require("../middleware/async");

const { Genre, validate } = require("../models/genre");

const router = express.Router();

//create new genre
router.post(
  "/",
  [auth, admin],
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message); //Bad Request
    }
    let new_genre = new Genre(req.body);
    new_genre = await new_genre.save();
    return res.send(new_genre);
  })
);

//read all genres
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const genres = await Genre.find().sort("name");
    return res.send(genres);
  })
);

//read genres by id
router.get(
  "/:id",
  objectid,
  asyncMiddleware(async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(genre);
    }
  })
);

//update genres by id
router.put(
  "/:id",
  [auth, admin, objectid],
  asyncMiddleware(async (req, res) => {
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
  })
);

//delete genre by id
router.delete(
  "/:id",
  [auth, admin, objectid],
  asyncMiddleware(async (req, res, next) => {
    const genre = await Genre.findByIdAndRemove(req.params.id);
    if (!genre) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(genre);
    }
  })
);

module.exports = router;
