const admin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).send("user is not an admin. operation not allowed"); //Forbidden
  }
  next();
};

module.exports = admin;
