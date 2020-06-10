const mongoose = require("mongoose");
const Joi = require("@hapi/joi"); //Object schema validation
Joi.objectId = require("joi-objectid")(Joi); //ObjectId validation support in joi

//create movie schema
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 50,
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre", //Note: name of model for genre schema
      required: true,
    },
    numberInStock: {
      type: Number,
      default: 1,
      min: 0,
    },
    dailyRentalRate: {
      type: Number,
      default: 10,
      min: 0,
    },
  },
  {
    collection: "movies", //Note: Name of collection in database
  }
);

//create model for movie
const Movie = new mongoose.model("Movie", movieSchema);

validateMovieReqBody = (req_body) => {
  const schema = Joi.object({
    title: Joi.string().max(50).required(),
    genre: Joi.objectId().required(),
    dailyRentalRate: Joi.number(),
  });

  return schema.validate(req_body);
};

module.exports.Movie = Movie;
module.exports.validate = validateMovieReqBody;
