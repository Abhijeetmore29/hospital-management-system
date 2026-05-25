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

function serializeAuthUser(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    department: user.department || user.staffRole || '',
    specialization: user.specialization || '',
    experience: user.experience || '',
    qualification: user.qualification || '',
    address: user.address || '',
    profileImage: user.profilePicture || '',
    profilePicture: user.profilePicture || '',
    signature: user.signature || '',
    joinedDate: user.createdAt || null,
    canAccessAdmin: user.role === 'doctor',
    isAdmin: user.role === 'admin'
  };
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
    user: serializeAuthUser(user)
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
    user: serializeAuthUser(user)
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ user: serializeAuthUser(user) });
});

const updateMe = asyncHandler(async (req, res) => {
  const { signature, profilePicture, address, phone } = req.body;

  if (signature !== undefined) {
    req.user.signature = signature;
  }

  if (profilePicture !== undefined) {
    req.user.profilePicture = profilePicture;
  }

  if (address !== undefined) {
    req.user.address = address;
  }

  if (phone !== undefined) {
    req.user.phone = phone;
  }

  const updatedUser = await req.user.save();
  res.json({
    user: serializeAuthUser(updatedUser)
  });
});

module.exports = {
  loginUser,
  logoutUser,
  registerUser,
  getMe,
  updateMe
};
