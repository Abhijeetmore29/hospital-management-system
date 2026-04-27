const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema(
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
    operationName: {
      type: String,
      required: true,
      trim: true
    },
    operationType: {
      type: String,
      enum: ['Minor', 'Major', 'Emergency'],
      default: 'Minor'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled'
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    operationDate: {
      type: Date
    },
    theatreRoom: {
      type: String,
      default: ''
    },
    anesthesiaType: {
      type: String,
      default: ''
    },
    preOpDiagnosis: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Operation', operationSchema);

