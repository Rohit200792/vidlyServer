const winston = require("winston"); //A logger for just about everything
const error = (ex, req, res, next) => {
  winston.log("error", ex.message, ex);
  //winston.error(err.message);
  //error, warn, info, verbose, debug, silly
  return res.status(500).send(ex.message); //Internal Server Error
};

module.exports = error;
