const asyncHandler = require('../utils/asyncHandler');
const Operation = require('../models/Operation');
const Patient = require('../models/Patient');
const User = require('../models/User');

const createOperation = asyncHandler(async (req, res) => {
  const {
    patientId,
    doctorId,
    operationName,
    operationType,
    status,
    scheduledDate,
    operationDate,
    theatreRoom,
    anesthesiaType,
    preOpDiagnosis,
    notes,
    estimatedCost
  } = req.body;

  if (!patientId || !doctorId || !operationName || !scheduledDate) {
    res.status(400);
    throw new Error('patientId, doctorId, operationName and scheduledDate are required');
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

  if (patient.type !== 'IPD') {
    res.status(400);
    throw new Error('Operations can only be created for IPD patients');
  }

  patient.status = 'Admitted';
  patient.assignedDoctor = doctorId;
  await patient.save();

  const operation = await Operation.create({
    patient: patientId,
    doctor: doctorId,
    operationName,
    operationType: operationType || 'Minor',
    status: status || 'Scheduled',
    scheduledDate,
    operationDate: operationDate || undefined,
    theatreRoom: theatreRoom || '',
    anesthesiaType: anesthesiaType || '',
    preOpDiagnosis: preOpDiagnosis || '',
    notes: notes || '',
    estimatedCost: estimatedCost !== undefined && estimatedCost !== null ? Number(estimatedCost) : 0,
    createdBy: req.user._id
  });

  const populated = await Operation.findById(operation._id)
    .populate('patient', 'name age gender phone disease type roomType status paymentStatus')
    .populate('doctor', 'name email role')
    .populate('createdBy', 'name email role');

  res.status(201).json(populated);
});

const getOperations = asyncHandler(async (req, res) => {
  const { patientId, doctorId, status } = req.query;
  const query = {};

  if (patientId) query.patient = patientId;
  if (doctorId) query.doctor = doctorId;
  if (status) query.status = status;

  if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }

  const operations = await Operation.find(query)
    .populate('patient', 'name age gender phone disease type roomType status paymentStatus')
    .populate('doctor', 'name email role')
    .populate('createdBy', 'name email role')
    .sort({ scheduledDate: -1, createdAt: -1 });

  res.json(operations);
});

const getOperationById = asyncHandler(async (req, res) => {
  const operation = await Operation.findById(req.params.id)
    .populate('patient', 'name age gender phone disease type roomType status paymentStatus')
    .populate('doctor', 'name email role signature')
    .populate('createdBy', 'name email role');

  if (!operation) {
    res.status(404);
    throw new Error('Operation not found');
  }

  res.json(operation);
});

const updateOperation = asyncHandler(async (req, res) => {
  const operation = await Operation.findById(req.params.id);

  if (!operation) {
    res.status(404);
    throw new Error('Operation not found');
  }

  ['patient', 'doctor', 'operationName', 'operationType', 'status', 'scheduledDate', 'operationDate', 'theatreRoom', 'anesthesiaType', 'preOpDiagnosis', 'notes', 'estimatedCost'].forEach((field) => {
    if (req.body[field] !== undefined) {
      operation[field] = req.body[field];
    }
  });

  operation.updatedBy = req.user._id;
  const updated = await operation.save();

  const populated = await Operation.findById(updated._id)
    .populate('patient', 'name age gender phone disease type roomType status paymentStatus')
    .populate('doctor', 'name email role')
    .populate('createdBy', 'name email role')
    .populate('updatedBy', 'name email role');

  res.json(populated);
});

module.exports = {
  createOperation,
  getOperations,
  getOperationById,
  updateOperation
};
