const morgan = require("morgan"); //Log HTTP Requests
const startupDebug = require("debug")("app:startup"); //Small debugging utility
const dbDebug = require("debug")("app:db"); //Small debugging utility
const config = require("config");
const winston = require("winston");

module.exports = function (app) {
  //Optional Properties
  //debug namespace
  startupDebug("startup Debug Enabled"); //export DEBUG=app:startup
  dbDebug("db Debug Enables"); //export DEBUG=app:db

  //Log HTTP requests only for development environment
  if (app.get("env") === "development") {
    //export NODE_ENV="development"
    app.use(morgan("tiny"));
  }

  //Configuration
  winston.info(`Application name: ${config.get("name")}`);
  winston.info(`Mail Server: ${config.get("mail.host")}`);
  //console.log(`Mail Password: ${config.get("mail.password")}`);
};
