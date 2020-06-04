//look in routes/auth, routes/customers and routes/genres for demo
//used only in case express-async-errors module is not available
const asyncMiddleware = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (ex) {
      next(ex);
    }
  };
};

module.exports = asyncMiddleware;
