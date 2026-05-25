const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Payment = require('../models/Payment');

const STAFF_ROLES = ['Receptionist', 'Nurse', 'Staff', 'Laboratory', 'Billing', 'Pharmacy'];

function serializeStaff(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    staffRole: user.staffRole || 'Staff',
    phone: user.phone || '',
    isActive: user.isActive !== false,
    permissions: user.permissions || [],
    createdAt: user.createdAt
  };
}

const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: 'doctor' })
    .select('_id name specialization department')
    .sort({ name: 1 });

  res.json(doctors.map((doctor) => ({
    _id: doctor._id,
    name: doctor.name,
    specialization: doctor.specialization || '',
    department: doctor.department || ''
  })));
});

function serializeDoctor(user) {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    specialization: user.specialization || '',
    department: user.department || '',
    experience: user.experience || '',
    qualification: user.qualification || '',
    isActive: user.isActive !== false,
    permissions: user.permissions || [],
    createdAt: user.createdAt
  };
}

const getAdminStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({ role: 'staff' })
    .select('name email role staffRole phone isActive permissions createdAt')
    .sort({ createdAt: -1 });

  res.json(staff.map(serializeStaff));
});

const createAdminStaff = asyncHandler(async (req, res) => {
  const { name, email, phone = '', staffRole = 'Staff', password, confirmPassword = '', permissions = [] } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(409);
    throw new Error('User already exists');
  }

  const staff = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    role: 'staff',
    staffRole,
    password,
    permissions,
    isActive: true
  });

  res.status(201).json(serializeStaff(staff));
});

const updateAdminStaff = asyncHandler(async (req, res) => {
  const staff = await User.findById(req.params.id);
  if (!staff || staff.role !== 'staff') {
    res.status(404);
    throw new Error('Staff not found');
  }

  const { name, email, phone, staffRole, isActive, permissions } = req.body;
  if (name !== undefined) staff.name = name;
  if (email !== undefined) staff.email = email.toLowerCase().trim();
  if (phone !== undefined) staff.phone = phone;
  if (staffRole !== undefined) staff.staffRole = staffRole;
  if (isActive !== undefined) staff.isActive = Boolean(isActive);
  if (permissions !== undefined) staff.permissions = permissions;

  const updated = await staff.save();
  res.json(serializeStaff(updated));
});

const deleteAdminStaff = asyncHandler(async (req, res) => {
  const staff = await User.findById(req.params.id);
  if (!staff || staff.role !== 'staff') {
    res.status(404);
    throw new Error('Staff not found');
  }

  await staff.deleteOne();
  res.json({ message: 'Staff deleted' });
});

const resetAdminStaffPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword = '' } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const staff = await User.findById(req.params.id);
  if (!staff || staff.role !== 'staff') {
    res.status(404);
    throw new Error('Staff not found');
  }

  staff.password = password;
  await staff.save();
  res.json({ message: 'Password reset successfully' });
});

const getAdminRevenueAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const [today, month, year, total, monthly, yearly, sources] = await Promise.all([
    Payment.aggregate([{ $match: { createdAt: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $match: { createdAt: { $gte: startOfYear } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    Payment.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1 } }
    ]),
    Payment.aggregate([
      {
        $group: {
          _id: '$billingType',
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);

  res.json({
    todayRevenue: today[0]?.total || 0,
    monthlyRevenue: month[0]?.total || 0,
    yearlyRevenue: year[0]?.total || 0,
    totalRevenue: total[0]?.total || 0,
    monthlyRevenueChart: monthly.map((item) => ({
      key: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      total: item.total
    })),
    yearlyRevenueChart: yearly.map((item) => ({
      key: String(item._id.year),
      total: item.total
    })),
    revenueSources: sources.map((item) => ({
      label: item._id || 'Other',
      total: item.total
    }))
  });
});

const getAdminDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: 'doctor' })
    .select('name email role phone specialization department experience qualification isActive permissions createdAt')
    .sort({ createdAt: -1 });

  res.json(doctors.map(serializeDoctor));
});

const createAdminDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone = '',
    specialization = '',
    department = '',
    experience = '',
    qualification = '',
    password,
    confirmPassword = '',
    permissions = []
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(409);
    throw new Error('User already exists');
  }

  const doctor = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    specialization: String(specialization).trim(),
    department: String(department).trim(),
    experience: String(experience).trim(),
    qualification: String(qualification).trim(),
    role: 'doctor',
    password,
    permissions,
    isActive: true
  });

  res.status(201).json(serializeDoctor(doctor));
});

const updateAdminDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(404);
    throw new Error('Doctor not found');
  }

  const { name, email, phone, specialization, department, experience, qualification, isActive, permissions } = req.body;
  if (name !== undefined) doctor.name = name;
  if (email !== undefined) doctor.email = email.toLowerCase().trim();
  if (phone !== undefined) doctor.phone = phone;
  if (specialization !== undefined) doctor.specialization = specialization;
  if (department !== undefined) doctor.department = department;
  if (experience !== undefined) doctor.experience = experience;
  if (qualification !== undefined) doctor.qualification = qualification;
  if (isActive !== undefined) doctor.isActive = Boolean(isActive);
  if (permissions !== undefined) doctor.permissions = permissions;

  const updated = await doctor.save();
  res.json(serializeDoctor(updated));
});

const deleteAdminDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(404);
    throw new Error('Doctor not found');
  }

  await doctor.deleteOne();
  res.json({ message: 'Doctor deleted' });
});

const resetAdminDoctorPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword = '' } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const doctor = await User.findById(req.params.id);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(404);
    throw new Error('Doctor not found');
  }

  doctor.password = password;
  await doctor.save();
  res.json({ message: 'Password reset successfully' });
});

module.exports = {
  getDoctors,
  getAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
  resetAdminStaffPassword,
  getAdminDoctors,
  createAdminDoctor,
  updateAdminDoctor,
  deleteAdminDoctor,
  resetAdminDoctorPassword,
  getAdminRevenueAnalytics,
  STAFF_ROLES
};
