const asyncHandler = require('../utils/asyncHandler');
const Patient = require('../models/Patient');

const buildSearchQuery = (search) => {
  if (!search) {
    return {};
  }

  return {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { disease: { $regex: search, $options: 'i' } }
    ]
  };
};

const createPatient = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    address: req.body.address,
    phone: req.body.phone,
    bloodGroup: req.body.bloodGroup || '',
    disease: req.body.disease,
    appointmentDate: req.body.appointmentDate || undefined,
    type: req.body.type || 'OPD',
    roomType: req.body.roomType || undefined,
    status: req.body.type === 'IPD' ? 'Admitted' : 'Pending',
    assignedDoctor: req.body.assignedDoctor || undefined,
    createdBy: req.user._id
  };

  const patient = await Patient.create(payload);
  res.status(201).json(patient);
});

const getPatients = asyncHandler(async (req, res) => {
  const { search = '', type, status } = req.query;
  const query = buildSearchQuery(search);

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  const patients = await Patient.find(query)
    .populate('createdBy', 'name role')
    .populate('assignedDoctor', 'name role')
    .sort({ createdAt: -1 });

  res.json(patients);
});

const getAdmittedPatients = asyncHandler(async (req, res) => {
  const { doctorId } = req.query;
  const query = { type: 'IPD', status: 'Admitted' };

  if (doctorId) {
    query.assignedDoctor = doctorId;
  }

  if (req.user.role === 'doctor') {
    query.assignedDoctor = req.user._id;
  }

  const patients = await Patient.find(query)
    .populate('createdBy', 'name role')
    .populate('assignedDoctor', 'name role')
    .sort({ updatedAt: -1 });

  res.json(patients);
});

const getWaitingOpdPatients = asyncHandler(async (req, res) => {
  const query = {
    type: 'OPD',
    status: { $in: ['Pending', 'In Progress'] }
  };

  if (req.user.role === 'doctor') {
    query.assignedDoctor = req.user._id;
  }

  const patients = await Patient.find(query)
    .populate('createdBy', 'name role')
    .populate('assignedDoctor', 'name role')
    .sort({ updatedAt: -1, createdAt: -1 });

  res.json(patients);
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('createdBy', 'name role')
    .populate('assignedDoctor', 'name role signature')
    .populate('dischargedBy', 'name role');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  res.json(patient);
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const fields = ['name', 'age', 'gender', 'address', 'phone', 'bloodGroup', 'disease', 'appointmentDate', 'type', 'roomType', 'status', 'diagnosis', 'requiredTests', 'assignedDoctor', 'paymentStatus'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      patient[field] = req.body[field];
    }
  });

  const updatedPatient = await patient.save();
  res.json(updatedPatient);
});

const addPrescription = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  patient.diagnosis = req.body.diagnosis ?? patient.diagnosis;
  patient.doctorPrescription = req.body.doctorPrescription ?? patient.doctorPrescription;
  patient.requiredTests = req.body.requiredTests ?? patient.requiredTests;
  patient.status = req.body.status || patient.status || 'Completed';

  const updatedPatient = await patient.save();
  res.json(updatedPatient);
});

const dischargePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  if (patient.type !== 'IPD') {
    res.status(400);
    throw new Error('Only IPD patients can be discharged');
  }

  patient.status = 'Discharged';
  patient.dischargeDate = req.body.dischargeDate || new Date();
  patient.dischargeSummary = req.body.dischargeSummary || '';
  patient.dischargedBy = req.user._id;

  const updatedPatient = await patient.save();
  res.json(updatedPatient);
});

const getPatientHistory = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('assignedDoctor', 'name role signature')
    .populate('createdBy', 'name role');

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const appointments = await require('../models/Appointment').find({ patient: patient._id })
    .populate('doctor', 'name email role')
    .sort({ appointmentDate: -1, createdAt: -1 });

  const payments = await require('../models/Payment').find({ patient: patient._id })
    .populate('doctor', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ patient, appointments, payments });
});

module.exports = {
  createPatient,
  getPatients,
  getAdmittedPatients,
  getWaitingOpdPatients,
  getPatientById,
  updatePatient,
  addPrescription,
  dischargePatient,
  getPatientHistory
};
