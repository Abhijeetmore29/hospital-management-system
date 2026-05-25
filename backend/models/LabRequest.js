const mongoose = require('mongoose');

const labRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    testName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    priority: {
      type: String,
      enum: ['Routine', 'Urgent', 'STAT'],
      default: 'Routine'
    },
    status: {
      type: String,
      enum: ['Draft', 'Requested', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Requested'
    },
    notes: {
      type: String,
      default: ''
    },
    resultSummary: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabRequest', labRequestSchema);
