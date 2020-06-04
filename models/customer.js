const mongoose = require("mongoose");
const Joi = require("@hapi/joi"); //Object schema validation
Joi.objectId = require("joi-objectid")(Joi); //ObjectId validation support in joi

//create customer schema
const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 30 },
    isGold: { type: Boolean, default: false },
    phone: { type: Number, required: true },
  },
  { collection: "customers" }
);

//create model for customer
const Customer = new mongoose.model("Customer", customerSchema);

validateCustomerReqBody = (req_body) => {
  const schema = Joi.object({
    name: Joi.string().max(30).required(),
    phone: Joi.string()
      .regex(/^[0-9]+$/)
      .length(10)
      .required(),
  });

  return schema.validate(req_body);
};

module.exports.Customer = Customer;
module.exports.validate = validateCustomerReqBody;
