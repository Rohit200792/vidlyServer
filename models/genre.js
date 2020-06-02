const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

//create genre schema
const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
    },
  },
  { collection: "genres" }
);

//create model for genre
const Genre = new mongoose.model("Genre", genreSchema);

validateGenreReqBody = (req_body) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
  });

  return schema.validate(req_body);
};

module.exports.Genre = Genre;
module.exports.validate = validateGenreReqBody;
