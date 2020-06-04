const mongoose = require("mongoose");
const Joi = require("@hapi/joi"); //Object schema validation
const passwordComplexity = require("joi-password-complexity"); //Creates a Joi object that validates password complexity.
const _ = require("lodash"); //A modern JavaScript utility library delivering modularity, performance & extras.
const jwt = require("jsonwebtoken"); //An implementation of JSON Web Tokens.
const config = require("config"); //Configuration control for production node deployments

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 1024,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 255,
      validate: {
        validator: (v) => {
          let emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(v);
        },
        message: "enter valid email id in format emailid@gmail.com",
      },
    },
    phone: {
      type: Number,
      required: true,
      validate: {
        validator: (v) => {
          let len = 0;
          while (v != 0) {
            len++;
            v = Math.floor(v / 10);
          }
          if (len === 10) {
            return true;
          } else {
            return false;
          }
        },
        message: "enter valid mobile number",
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "users" }
);

userSchema.methods.getAuthToken = function () {
  return jwt.sign(
    _.pick(this, ["id", "email", "phone", "isAdmin"]),
    config.get("jwtPrivateKey")
  );
};

const User = new mongoose.model("User", userSchema);

validateUserReqBody = (req_body) => {
  const complexityOptions = {
    min: 8,
    max: 255,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
  };

  const schema = Joi.object({
    name: Joi.string().max(30).required(),
    password: Joi.string().required(),
    email: Joi.string().email().max(255).required(),
    phone: Joi.string()
      .regex(/^[0-9]+$/)
      .length(10)
      .required(),
  });

  const validation_out = schema.validate(req_body);
  if (!validation_out.error) {
    return passwordComplexity(complexityOptions, "Password").validate(
      req_body.password
    );
  } else {
    return validation_out;
  }
};

module.exports.User = User;
module.exports.validate = validateUserReqBody;
