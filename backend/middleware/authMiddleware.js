const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }

  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }

  req.user = user;
  next();
});

module.exports = { protect };
