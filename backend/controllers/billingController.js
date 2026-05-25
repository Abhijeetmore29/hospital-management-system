const asyncHandler = require('../utils/asyncHandler');
const Billing = require('../models/Billing');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

function calculateTotal(payload) {
  const consultationFee = Number(payload.consultationFee || 0);
  const laboratoryCharges = Number(payload.laboratoryCharges || 0);
  const medicineCharges = Number(payload.medicineCharges || 0);
  const additionalCharges = Number(payload.additionalCharges || 0);
  const discount = Number(payload.discount || 0);
  return Math.max(0, consultationFee + laboratoryCharges + medicineCharges + additionalCharges - discount);
}

const listBillings = asyncHandler(async (req, res) => {
  const items = await Billing.find()
    .populate('appointment', 'appointmentDate timeSlot reason visitType')
    .populate('patient', 'name age gender phone disease type roomType paymentStatus')
    .populate('doctor', 'name role')
    .sort({ createdAt: -1 });

  res.json(items);
});

const createBilling = asyncHandler(async (req, res) => {
  const {
    appointmentId,
    patientId,
    doctorId,
    consultationFee = 0,
    laboratoryCharges = 0,
    medicineCharges = 0,
    additionalCharges = 0,
    discount = 0,
    amount,
    paymentMethod = 'Cash',
    status = 'Pending',
    notes = '',
    billingDate
  } = req.body;

  let appointment = null;
  let patient = null;
  let doctor = null;

  if (appointmentId) {
    appointment = await Appointment.findById(appointmentId).populate('patient').populate('doctor');
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }
    patient = appointment.patient;
    doctor = appointment.doctor;
  } else {
    patient = await Patient.findById(patientId);
    doctor = await User.findById(doctorId);
  }

  if (!patient || !doctor) {
    res.status(400);
    throw new Error('Patient and doctor are required');
  }

  const totalAmount = amount !== undefined && amount !== null && amount !== ''
    ? Number(amount)
    : calculateTotal({ consultationFee, laboratoryCharges, medicineCharges, additionalCharges, discount });

  const item = await Billing.create({
    appointment: appointment?._id,
    patient: patient._id,
    doctor: doctor._id,
    consultationFee,
    laboratoryCharges,
    medicineCharges,
    additionalCharges,
    discount,
    amount: totalAmount,
    totalAmount,
    paymentMethod,
    status,
    billingDate: billingDate || Date.now(),
    notes
  });

  if (status === 'Paid') {
    patient.paymentStatus = 'Paid';
    await patient.save();
  }

  const populated = await Billing.findById(item._id)
    .populate('appointment', 'appointmentDate timeSlot reason visitType')
    .populate('patient', 'name age gender phone disease type roomType paymentStatus')
    .populate('doctor', 'name role');

  res.status(201).json(populated);
});

const getBillingById = asyncHandler(async (req, res) => {
  const item = await Billing.findById(req.params.id)
    .populate('appointment', 'appointmentDate timeSlot reason visitType')
    .populate('patient', 'name age gender phone disease type roomType paymentStatus diagnosis doctorPrescription requiredTests assignedDoctor')
    .populate('doctor', 'name email role signature profilePicture');
  if (!item) {
    res.status(404);
    throw new Error('Billing record not found');
  }

  res.json(item);
});

const updateBilling = asyncHandler(async (req, res) => {
  const item = await Billing.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Billing record not found');
  }

  const fields = ['consultationFee', 'laboratoryCharges', 'medicineCharges', 'additionalCharges', 'discount', 'amount', 'paymentMethod', 'status', 'notes', 'billingDate'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  if (req.body.status === 'Paid') {
    item.status = 'Paid';
  }

  item.totalAmount = calculateTotal(item);
  item.amount = item.amount || item.totalAmount;

  const updated = await item.save();
  if (updated.status === 'Paid') {
    await Patient.findByIdAndUpdate(updated.patient, { paymentStatus: 'Paid' });
  }
  const populated = await Billing.findById(updated._id)
    .populate('appointment', 'appointmentDate timeSlot reason visitType')
    .populate('patient', 'name age gender phone disease type roomType paymentStatus')
    .populate('doctor', 'name role');

  res.json(populated);
});

const markBillingPaid = asyncHandler(async (req, res) => {
  const item = await Billing.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Billing record not found');
  }

  item.status = 'Paid';
  item.amount = calculateTotal(item);
  item.totalAmount = item.amount;
  const updated = await item.save();
  await Patient.findByIdAndUpdate(updated.patient, { paymentStatus: 'Paid' });
  const populated = await Billing.findById(updated._id)
    .populate('appointment', 'appointmentDate timeSlot reason visitType')
    .populate('patient', 'name age gender phone disease type roomType paymentStatus')
    .populate('doctor', 'name role');
  res.json(populated);
});

module.exports = {
  listBillings,
  createBilling,
  getBillingById,
  updateBilling,
  markBillingPaid
};
