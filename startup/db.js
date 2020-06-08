const mongoose = require("mongoose"); //Mongoose MongoDB ODM
const winston = require("winston"); //A logger for just about everything
const config = require("config");

module.exports = async function (url) {
  //connect to mongoDB cluster
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, //for using property unique:true in mongoose.Schema
  });

  winston.info(`Connected to ${config.get("db")} DB`);
};
