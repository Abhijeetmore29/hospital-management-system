const asyncHandler = require('../utils/asyncHandler');
const LabRequest = require('../models/LabRequest');

const listLabRequests = asyncHandler(async (req, res) => {
  const items = await LabRequest.find()
    .populate('patient', 'name phone')
    .populate('doctor', 'name role')
    .sort({ createdAt: -1 });

  res.json(items);
});

const createLabRequest = asyncHandler(async (req, res) => {
  const item = await LabRequest.create(req.body);
  res.status(201).json(item);
});

const getLabRequestById = asyncHandler(async (req, res) => {
  const item = await LabRequest.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Lab request not found');
  }

  res.json(item);
});

const updateLabRequest = asyncHandler(async (req, res) => {
  const item = await LabRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) {
    res.status(404);
    throw new Error('Lab request not found');
  }

  res.json(item);
});

module.exports = {
  listLabRequests,
  createLabRequest,
  getLabRequestById,
  updateLabRequest
};
