const express = require("express");
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt"); //A library to help you hash passwords.
const _ = require("lodash"); //A modern JavaScript utility library delivering modularity, performance & extras.

const asyncMiddleware = require("../middleware/async");
const { User } = require("../models/user");

const router = express.Router();

//authenticate user
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send("Invalid email or password");
    }
    const valid_password = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!valid_password) {
      return res.status(404).send("Invalid email or password");
    }

    const token = user.getAuthToken();
    return res.send(token);
  })
);

validate = (req_body) => {
  const schema = Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().required(),
  });

  return schema.validate(req_body);
};

module.exports = router;
