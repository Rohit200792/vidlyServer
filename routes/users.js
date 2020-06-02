const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

//create new user account
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
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
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

//read all user details
router.get("/me", auth, async (req, res) => {
  try {
    return res.send(req.user);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

//read all user details
router.get("/", [auth, admin], async (req, res) => {
  try {
    let users = await User.find().sort("name");
    return res.send(
      users.map((user) => {
        return _.pick(user, ["_id", "name"]);
      })
    );
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

module.exports = router;
