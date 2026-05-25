const asyncHandler = require('../utils/asyncHandler');
const PatientHistory = require('../models/PatientHistory');

const getPatientHistory = asyncHandler(async (req, res) => {
  const item = await PatientHistory.findOne({ patient: req.params.patientId }).populate('patient', 'name phone');
  res.json(item || { patient: req.params.patientId, entries: [] });
});

const addPatientHistoryEntry = asyncHandler(async (req, res) => {
  const { type, title, description = '', createdBy = null } = req.body;
  const item = await PatientHistory.findOneAndUpdate(
    { patient: req.params.patientId },
    {
      $setOnInsert: { patient: req.params.patientId },
      $push: { entries: { type, title, description, createdBy } }
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('patient', 'name phone');

  res.status(201).json(item);
});

module.exports = {
  getPatientHistory,
  addPatientHistoryEntry
};
