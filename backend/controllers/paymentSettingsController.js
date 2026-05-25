const asyncHandler = require('../utils/asyncHandler');
const PaymentSettings = require('../models/PaymentSettings');

const listPaymentSettings = asyncHandler(async (req, res) => {
  const { doctorId } = req.query;
  if (doctorId) {
    const item = await PaymentSettings.findOne({ doctor: doctorId }).populate('doctor', 'name email role');
    res.json(item || null);
    return;
  }

  const items = await PaymentSettings.find().populate('doctor', 'name email role');
  res.json(items);
});

const upsertPaymentSettings = asyncHandler(async (req, res) => {
  const { doctor } = req.body;
  const item = await PaymentSettings.findOneAndUpdate(
    { doctor },
    req.body,
    { new: true, upsert: true, runValidators: true }
  ).populate('doctor', 'name email role');

  res.status(201).json(item);
});

module.exports = {
  listPaymentSettings,
  upsertPaymentSettings
};
