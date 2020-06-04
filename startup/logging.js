const process = require("process");
require("express-async-errors"); //A dead simple ES6 async/await support hack for ExpressJS
const winston = require("winston"); //A logger for just about everything
require("winston-mongodb"); //A MongoDB transport for winston.

module.exports.unhandled = function () {
  //uncaught exceptions
  process.on("uncaughtException", (ex) => {
    winston.error(ex.message, ex);
    process.exit(1);
  });

  //unhandled promise rejections
  process.on("unhandledRejection", (ex) => {
    winston.error(ex.message, ex);
    process.exit(1);
  });
};

module.exports.fileLog = function () {
  winston.add(new winston.transports.File({ filename: "logfile.log" })); //File transport for logging errors
};

module.exports.dbLog = function (url) {
  winston.add(
    new winston.transports.MongoDB({
      //MongoDB transport for logging errors
      db: url,
      level: "error", //error warn info verbose debug silly
      options: { useUnifiedTopology: true },
    })
  );
};
