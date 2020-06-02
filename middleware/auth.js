const jwt = require("jsonwebtoken");
const config = require("config");
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send("authentication token not found. please login"); //Unauthorized
  }
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send("invalid authentication token");
  }
};

module.exports = auth;
