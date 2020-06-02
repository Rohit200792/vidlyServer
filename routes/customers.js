const express = require("express");
const mongoose = require("mongoose");
const { Customer, validate } = require("../models/customer");

const router = express.Router();

//create new customer
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    try {
      let new_customer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone,
      });

      new_customer = await new_customer.save();
      return res.send(new_customer);
    } catch (err) {
      return res.status(500).send(err.message); //Internal Server Error
    }
  }
});

//read all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort("name");
    return res.send(customers);
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//read customer by id
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send("Data Not Found");
    } else {
      return res.send(customer);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//update customer by id
router.put("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
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
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

//delete customer by id
router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  }
  try {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) {
      return res.status(404).send("Data not Send");
    } else {
      return res.send(customer);
    }
  } catch (err) {
    return res.status(500).send(err.message); //Internal Server Error
  }
});

module.exports = router;
