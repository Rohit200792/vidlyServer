config = require("config");
module.exports = function () {
  if (!config.get("mongodb.password")) {
    throw new Error("mongodb environment variable not set");
  }

  if (!config.get("jwtPrivateKey")) {
    throw new Error("mongodb environment variable not set");
  }
};
