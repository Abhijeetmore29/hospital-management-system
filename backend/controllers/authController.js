const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: '7d' }
  );
}

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = signToken(user);
  res.json({
    token,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      signature: user.signature || '',
      profilePicture: user.profilePicture || ''
    }
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out' });
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password and role are required');
  }

  if (!['doctor', 'staff'].includes(role)) {
    res.status(400);
    throw new Error('Role must be doctor or staff');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      signature: user.signature || '',
      profilePicture: user.profilePicture || ''
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const updateMe = asyncHandler(async (req, res) => {
  const { signature, profilePicture } = req.body;

  if (signature !== undefined) {
    req.user.signature = signature;
  }

  if (profilePicture !== undefined) {
    req.user.profilePicture = profilePicture;
  }

  const updatedUser = await req.user.save();
  res.json({
    user: {
      _id: updatedUser._id,
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      signature: updatedUser.signature || '',
      profilePicture: updatedUser.profilePicture || ''
    }
  });
});

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  getMe,
  updateMe
};
