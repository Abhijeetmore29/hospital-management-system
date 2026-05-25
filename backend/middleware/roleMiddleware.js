function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden'));
    }

    next();
  };
}

module.exports = { authorizeRoles };
