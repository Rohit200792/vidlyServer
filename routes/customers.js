const express = require("express");
const mongoose = require("mongoose");

const asyncMiddleware = require("../middleware/async");

const { Customer, validate } = require("../models/customer");

const router = express.Router();

//create new customer
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    let new_customer = new Customer({
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone,
    });

    new_customer = await new_customer.save();
    return res.send(new_customer);
  })
);

//read all customers
router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    const customers = await Customer.find().sort("name");
    return res.send(customers);
  })
);

//read customer by id
router.get(
  "/:id",
  asyncMiddleware(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("ObjectId format is not valid");
    }
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(customer);
    }
  })
);

//update customer by id
router.put(
  "/:id",
  asyncMiddleware(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("ObjectId format is not valid");
    }
    let customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone,
      },
      { new: true, useFindAndModify: false }
    );
    if (!customer) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(customer);
    }
  })
);

//delete customer by id
router.delete(
  "/:id",
  asyncMiddleware(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("ObjectId format is not valid");
    }
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) {
      return res.status(404).send("Data not Send");
    } else {
      return res.send(customer);
    }
  })
);

module.exports = router;
