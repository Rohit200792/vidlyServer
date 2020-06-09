const winston = require("winston");

const port = process.env.PORT || 3000;
module.exports = function (app) {
  return app.listen(port, () => {
    winston.info(`Listening on port ${port}...`);
  });
};
