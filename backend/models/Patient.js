const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 0
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other']
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    disease: {
      type: String,
      required: true,
      trim: true
    },
    appointmentDate: {
      type: Date
    },
    type: {
      type: String,
      enum: ['OPD', 'IPD'],
      default: 'OPD'
    },
    roomType: {
      type: String,
      enum: ['AC', 'Non-AC'],
      default: undefined
    },
    diagnosis: {
      type: String,
      default: ''
    },
    doctorPrescription: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Admitted', 'Completed', 'Discharged'],
      default: 'Pending'
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Partially Paid'],
      default: 'Pending'
    },
    dischargeDate: {
      type: Date
    },
    dischargeSummary: {
      type: String,
      default: ''
    },
    dischargedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
