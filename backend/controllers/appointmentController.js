const asyncHandler = require('../utils/asyncHandler');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, appointmentDate, timeSlot, reason } = req.body;

  if (!patientId || !doctorId || !appointmentDate) {
    res.status(400);
    throw new Error('patientId, doctorId and appointmentDate are required');
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
    throw new Error('Selected doctor is invalid');
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorId,
    appointmentDate,
    timeSlot: timeSlot || '09:00',
    reason: reason || patient.disease,
    createdBy: req.user._id
  });

  patient.appointmentDate = appointmentDate;
  patient.assignedDoctor = doctorId;
  await patient.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'name age phone disease type status')
    .populate('doctor', 'name email role');

  res.status(201).json(populated);
});

const getAppointments = asyncHandler(async (req, res) => {
  const { doctorId, date, status } = req.query;
  const query = {};

  if (doctorId) {
    query.doctor = doctorId;
  }

  if (status) {
    query.status = status;
  }

  if (date) {
    const targetDate = new Date(date);
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);
    query.appointmentDate = { $gte: start, $lte: end };
  }

  if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name age phone disease type status appointmentDate')
    .populate('doctor', 'name email role')
    .sort({ appointmentDate: 1, createdAt: -1 });

  res.json(appointments);
});

const getTodaysAppointments = asyncHandler(async (req, res) => {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const query = {
    appointmentDate: { $gte: start, $lte: end }
  };

  if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }

  const appointments = await Appointment.find(query)
    .populate('patient', 'name age phone disease type status appointmentDate diagnosis doctorPrescription')
    .populate('doctor', 'name email role')
    .sort({ appointmentDate: 1 });

  res.json(appointments);
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  ['appointmentDate', 'timeSlot', 'reason', 'status', 'doctor', 'patient'].forEach((field) => {
    if (req.body[field] !== undefined) {
      appointment[field] = req.body[field];
    }
  });

  const updated = await appointment.save();
  res.json(updated);
});

module.exports = {
  createAppointment,
  getAppointments,
  getTodaysAppointments,
  updateAppointment
};

