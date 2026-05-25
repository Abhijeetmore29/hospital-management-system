const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true, _id: false }
);

const patientHistorySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true
    },
    entries: {
      type: [historyEntrySchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PatientHistory', patientHistorySchema);
