const mongoose = require("mongoose");
const Joi = require("@hapi/joi"); //Object schema validation
Joi.objectId = require("joi-objectid")(Joi); //ObjectId validation support in joi

rentalSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  dateOut: { type: Date, default: Date.now },
  dateReturned: { type: Date, default: null },
  rentalFee: { type: Number, default: 0, min: 0 },
});

const Rental = mongoose.model("Rental", rentalSchema);

validateRentalReqBody = (req_body) => {
  const schema = Joi.object({
    customer: Joi.objectId().required(),
    movie: Joi.objectId().required(),
  });

  return schema.validate(req_body);
};

module.exports.Rental = Rental;
module.exports.validate = validateRentalReqBody;
