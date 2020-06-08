// api/genres/
// api/customers/
// api/movies/
// api/rentals
// api/users/
// api/auth/
const express = require("express"); //Fast, unopinionated, minimalist web framework to develop http server side application
const config = require("config"); //Configuration control for production node deployments
const winston = require("winston"); //A logger for just about everything
const app = express();

async function startup() {
  //initiate error logger- file based
  require("./startup/logging").fileLog();

  //to give time to initiate file logger
  setTimeout(async () => {
    require("./startup/logging").unhandled();
    require("./startup/config");

    //mongodb addess
    const url = `mongodb+srv://rohit:${config.get(
      "mongodb.password"
    )}@cluster0-yyn3g.mongodb.net/${config.get(
      "db"
    )}?retryWrites=true&w=majority`;

    if (app.get("env") != "test") {
      //initiate error logger- mongodb based
      require("./startup/logging").dbLog(url);
    }

    //to give time to initiate mongodb logger
    setTimeout(async () => {
      //connect to db
      await require("./startup/db")(url);

      //add route handlers
      require("./startup/routes")(app);

      winston.info("server startup complete");

      require("./startup/optional")(app);
    }, 1000);
  }, 1000);
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
  winston.info(`Listening on port ${port}...`);
});

startup();

module.exports = app;
