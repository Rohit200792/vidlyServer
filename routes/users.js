const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //A library to help you hash passwords.
const _ = require("lodash"); //A modern JavaScript utility library delivering modularity, performance & extras.

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const objectid = require("../middleware/objectid");

const { User, validate } = require("../models/user");

const router = express.Router();

//create new user account
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res
      .status(400)
      .send("User with same email id is already registered");
  }
  const new_user = new User(req.body);

  const salt = await bcrypt.genSalt(10);
  new_user.password = await bcrypt.hash(req.body.password, salt);

  await new_user.save();
  const token = new_user.getAuthToken();
  return res
    .header("x-auth-token", token)
    .send(_.pick(new_user, ["_id", "name", "email"]));
});

//read user's details
router.get("/me", auth, async (req, res) => {
  return res.send(req.user);
});

//read all user details
router.get("/", [auth, admin], async (req, res) => {
  let users = await User.find().sort("name");
  return res.send(
    users.map((user) => {
      return _.pick(user, ["_id", "name"]);
    })
  );
});

//read all user details by id
router.get("/:id", [auth, admin, objectid], async (req, res) => {
  let user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send("Data Not Found");
  } else {
    return res.send(_.pick(user, ["_id", "name"]));
  }
});
module.exports = router;
