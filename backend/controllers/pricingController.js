const asyncHandler = require('../utils/asyncHandler');
const DoctorPricing = require('../models/DoctorPricing');
const User = require('../models/User');

const getMyPricing = asyncHandler(async (req, res) => {
  const pricing = await DoctorPricing.findOne({ doctor: req.user._id }).populate('doctor', 'name email role');
  res.json(
    pricing || {
      doctor: req.user,
      opdFee: 0,
      ipdAcFee: 0,
      ipdNonAcFee: 0,
      consultationFee: 0,
      upiId: '',
      upiPayeeName: ''
    }
  );
});

const upsertMyPricing = asyncHandler(async (req, res) => {
  const {
    opdFee = 0,
    ipdAcFee = 0,
    ipdNonAcFee = 0,
    consultationFee = 0,
    upiId = '',
    upiPayeeName = ''
  } = req.body;

  const pricing = await DoctorPricing.findOneAndUpdate(
    { doctor: req.user._id },
    {
      doctor: req.user._id,
      opdFee,
      ipdAcFee,
      ipdNonAcFee,
      consultationFee,
      upiId,
      upiPayeeName,
      updatedBy: req.user._id
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  ).populate('doctor', 'name email role');

  res.json(pricing);
});

const getAllDoctorPricing = asyncHandler(async (req, res) => {
  const pricing = await DoctorPricing.find()
    .populate('doctor', 'name email role')
    .sort({ updatedAt: -1 });

  const doctors = await User.find({ role: 'doctor' }).select('name email role').sort({ name: 1 });

  res.json({ pricing, doctors });
});

module.exports = {
  getMyPricing,
  upsertMyPricing,
  getAllDoctorPricing
};
