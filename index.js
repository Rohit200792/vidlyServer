// api/genres/
// api/customers/
// api/movies/
// api/rentals
// api/users/
// api/auth/
const express = require("express");
const morgan = require("morgan");
const config = require("config");
const startupDebug = require("debug")("app:startup");
const dbDebug = require("debug")("app:db");

const mongoose = require("mongoose");
const logger = require("./middleware/logger");
const home = require("./routes/home");
const genre = require("./routes/genres");
const customer = require("./routes/customers");
const movie = require("./routes/movies");
const rental = require("./routes/rentals");
const user = require("./routes/users");
const auth = require("./routes/auth");

//connect to mongoDB cluster

let url = `mongodb+srv://rohit:${config.get(
  "mongodb.password"
)}@cluster0-yyn3g.mongodb.net/vidly?retryWrites=true&w=majority`;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, //for usinf property unique:true in mongoose.Schema
  })
  .then(() => {
    console.log("Succesfully Connected to Database!");
    const app = express();
    app.use(express.json());
    app.use(logger);
    app.use("/api", home);
    app.use("/api/genres", genre);
    app.use("/api/customers", customer);
    app.use("/api/movies", movie);
    app.use("/api/rentals", rental);
    app.use("/api/users", user);
    app.use("/api/auth", auth);

    //Debug namespace
    startupDebug("startup Debug Enabled"); //export DEBUG=app:startup
    dbDebug("db Debug Enables"); //export DEBUG=app:db

    //Log HTTP requests only for development environment
    if (app.get("env") === "development") {
      //export NODE_ENV="development"
      app.use(morgan("tiny"));
    }

    //Configuration
    console.log(`Application name: ${config.get("name")}`);
    console.log(`Mail Server: ${config.get("mail.host")}`);
    //console.log(`Mail Password: ${config.get("mail.password")}`);

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Listening on port ${port}...`);
    });
  })
  .catch((err) => console.error("Error in Connecting to Database! ", err));
