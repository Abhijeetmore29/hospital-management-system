const asyncHandler = require('../utils/asyncHandler');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');

const createAppointment = asyncHandler(async (req, res) => {
  const {
    patientId,
    patient,
    patientName,
    phone,
    age,
    gender,
    doctor,
    doctorId,
    appointmentDate,
    date,
    timeSlot,
    slot,
    reason,
    visitType,
    status
  } = req.body;

  const targetDoctorId = doctorId || doctor;
  const targetPatientId = patientId || patient;
  const targetDate = appointmentDate || date;
  const targetSlot = timeSlot || slot || '09:00';

  if (!targetDoctorId || !targetDate) {
    res.status(400);
    throw new Error('doctor and appointmentDate are required');
  }

  const doctorUser = await User.findById(targetDoctorId);
  if (!doctorUser || doctorUser.role !== 'doctor') {
    res.status(400);
    throw new Error('Selected doctor is invalid');
  }

  let patientDoc = targetPatientId ? await Patient.findById(targetPatientId) : null;
  if (!patientDoc) {
    if (!patientName || !phone) {
      res.status(400);
      throw new Error('patientName and phone are required');
    }

    patientDoc = await Patient.findOne({ phone: String(phone).trim() });
    if (!patientDoc) {
      patientDoc = await Patient.create({
        name: String(patientName).trim(),
        age: Number(age) || 0,
        gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other',
        address: 'Online Booking',
        phone: String(phone).trim(),
        disease: reason || visitType || 'Appointment',
        type: visitType === 'IPD' ? 'IPD' : 'OPD',
        createdBy: doctorUser._id
      });
    }
  }

  const appointment = await Appointment.create({
    patient: patientDoc._id,
    patientName: patientDoc.name,
    phone: patientDoc.phone,
    doctor: doctorUser._id,
    appointmentDate: targetDate,
    timeSlot: targetSlot,
    reason: reason || visitType || patientDoc.disease,
    visitType: visitType || 'OPD',
    status: String(status || 'pending').toLowerCase(),
    createdBy: req.user?._id || doctorUser._id
  });

  if (patientDoc) {
    patientDoc.appointmentDate = targetDate;
    patientDoc.assignedDoctor = doctorUser._id;
    await patientDoc.save();
  }

  const populated = await Appointment.findById(appointment._id)
    .populate('patient', 'name age phone disease type status')
    .populate('doctor', 'name email role');

  res.status(201).json(populated);
});

const getPublicAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name age phone disease type status')
    .populate('doctor', 'name email role');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  res.json(appointment);
});

const getAppointments = asyncHandler(async (req, res) => {
  const { doctorId, date, status } = req.query;
  const query = {};

  if (doctorId) {
    query.doctor = doctorId;
  }

  if (status) {
    const normalized = String(status).toLowerCase();
    query.status = normalized === 'pending' ? { $in: ['pending'] } : normalized;
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

const getOpdQueue = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ status: { $in: ['confirmed', 'Confirmed'] } })
    .populate('patient', 'name age gender phone disease type status')
    .populate('doctor', 'name email role')
    .sort({ appointmentDate: 1, timeSlot: 1, createdAt: -1 });

  res.json(appointments);
});

const getConsultationByAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.appointmentId)
    .populate('patient', 'name age gender phone disease type status appointmentDate diagnosis doctorPrescription requiredTests')
    .populate('doctor', 'name email role');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const history = await Appointment.find({ patient: appointment.patient._id })
    .sort({ appointmentDate: -1, createdAt: -1 })
    .populate('doctor', 'name email role');

  res.json({ appointment, patient: appointment.patient, doctor: appointment.doctor, history });
});

const updateConsultation = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const patient = await Patient.findById(appointment.patient);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  patient.diagnosis = req.body.diagnosis ?? patient.diagnosis;
  patient.doctorPrescription = req.body.doctorPrescription ?? patient.doctorPrescription;
  patient.requiredTests = req.body.requiredTests ?? patient.requiredTests;
  if (req.body.complete === true || String(req.body.status).toLowerCase() === 'completed') {
    patient.status = 'Completed';
  } else if (req.body.sendToLab === true) {
    patient.status = 'In Progress';
  } else if (req.body.followUp === true) {
    patient.status = 'Pending';
  }
  await patient.save();

  if (req.body.complete === true || String(req.body.status).toLowerCase() === 'completed') {
    appointment.status = 'completed';
  } else if (req.body.sendToLab === true) {
    appointment.status = 'confirmed';
  } else {
    appointment.status = 'confirmed';
  }
  await appointment.save();

  const updated = await Appointment.findById(appointment._id)
    .populate('patient', 'name age gender phone disease type status appointmentDate diagnosis doctorPrescription requiredTests')
    .populate('doctor', 'name email role');

  res.json(updated);
});

const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  ['appointmentDate', 'timeSlot', 'reason', 'visitType', 'status', 'doctor', 'patient'].forEach((field) => {
    if (req.body[field] !== undefined) {
      appointment[field] = field === 'status' ? String(req.body[field]).toLowerCase() : req.body[field];
    }
  });
  if (req.body.patientName !== undefined) appointment.patientName = req.body.patientName;
  if (req.body.phone !== undefined) appointment.phone = req.body.phone;

  const updated = await appointment.save();
  res.json(updated);
});

const reassignAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const doctorId = req.body.doctorId || req.body.doctor;
  if (doctorId) appointment.doctor = doctorId;
  if (req.body.reason !== undefined) appointment.reason = req.body.reason;
  if (req.body.status !== undefined) appointment.status = String(req.body.status).toLowerCase();

  const updated = await appointment.save();
  res.json(updated);
});

module.exports = {
  createAppointment,
  getPublicAppointmentById,
  getAppointments,
  getTodaysAppointments,
  getOpdQueue,
  getConsultationByAppointment,
  updateConsultation,
  updateAppointment,
  reassignAppointment
};
