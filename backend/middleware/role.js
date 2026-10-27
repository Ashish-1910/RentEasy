// Allows only the listed roles, e.g. authorize("owner")
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Access denied: ${req.user.role} cannot perform this action`),
      );
    }
    next();
  };

module.exports = { authorize };
