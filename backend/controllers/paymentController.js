const asyncHandler = require('../utils/asyncHandler');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const DoctorPricing = require('../models/DoctorPricing');
const User = require('../models/User');

async function resolveAmount({ doctorId, billingType, roomType }) {
  const pricing = await DoctorPricing.findOne({ doctor: doctorId });
  if (!pricing) {
    return null;
  }

  if (billingType === 'OPD') {
    return pricing.opdFee ?? pricing.consultationFee ?? 0;
  }

  if (billingType === 'IPD' && roomType === 'AC') {
    return pricing.ipdAcFee ?? 0;
  }

  if (billingType === 'IPD' && roomType === 'Non-AC') {
    return pricing.ipdNonAcFee ?? 0;
  }

  return 0;
}

const createPayment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, billingType, roomType, amount, paymentMethod, transactionId, notes } = req.body;

  if (!patientId || !doctorId || !billingType) {
    res.status(400);
    throw new Error('patientId, doctorId and billingType are required');
  }

  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    User.findById(doctorId)
  ]);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  if (!doctor || doctor.role !== 'doctor') {
    res.status(400);
    throw new Error('Invalid doctor selected');
  }

  if (billingType === 'IPD' && !roomType) {
    res.status(400);
    throw new Error('Room type is required for IPD payments');
  }

  const resolvedAmount = amount !== undefined && amount !== null && amount !== ''
    ? Number(amount)
    : await resolveAmount({ doctorId, billingType, roomType });

  if ((amount === undefined || amount === null || amount === '') && resolvedAmount === null) {
    res.status(400);
    throw new Error('Please configure doctor pricing or enter a manual amount');
  }

  if (Number.isNaN(resolvedAmount) || resolvedAmount < 0) {
    res.status(400);
    throw new Error('Invalid payment amount');
  }

  const payment = await Payment.create({
    patient: patientId,
    doctor: doctorId,
    billingType,
    roomType: roomType || undefined,
    amount: resolvedAmount,
    paymentMethod: paymentMethod || 'Cash',
    transactionId: transactionId || '',
    notes: notes || '',
    collectedBy: req.user._id
  });

  patient.paymentStatus = 'Paid';
  if (!patient.assignedDoctor) {
    patient.assignedDoctor = doctorId;
  }
  if (billingType === 'IPD' && roomType) {
    patient.roomType = roomType;
  }
  await patient.save();

  const populated = await Payment.findById(payment._id)
    .populate('patient', 'name age phone disease type roomType paymentStatus')
    .populate('doctor', 'name email role')
    .populate('collectedBy', 'name email role');

  res.status(201).json(populated);
});

const getPayments = asyncHandler(async (req, res) => {
  const { doctorId, patientId, billingType } = req.query;
  const query = {};

  if (doctorId) query.doctor = doctorId;
  if (patientId) query.patient = patientId;
  if (billingType) query.billingType = billingType;

  if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }

  const payments = await Payment.find(query)
    .populate('patient', 'name age phone disease type roomType paymentStatus')
    .populate('doctor', 'name email role')
    .populate('collectedBy', 'name email role')
    .sort({ createdAt: -1 });

  res.json(payments);
});

const getPaymentSummary = asyncHandler(async (req, res) => {
  const query = req.user.role === 'doctor' ? { doctor: req.user._id } : {};
  const [count, totalAmount, opdCount, ipdCount] = await Promise.all([
    Payment.countDocuments(query),
    Payment.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Payment.countDocuments({ ...query, billingType: 'OPD' }),
    Payment.countDocuments({ ...query, billingType: 'IPD' })
  ]);

  res.json({
    count,
    totalAmount: totalAmount[0]?.total || 0,
    opdCount,
    ipdCount
  });
});

module.exports = {
  createPayment,
  getPayments,
  getPaymentSummary
};
