const mongoose = require("mongoose");
const objectid = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("ObjectId format is not valid");
  } else {
    next();
  }
};

module.exports = objectid;
