const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    patientName: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appointmentDate: {
      type: Date,
      alias: 'date',
      required: true
    },
    timeSlot: {
      type: String,
      alias: 'slot',
      default: '09:00'
    },
    reason: {
      type: String,
      default: ''
    },
    visitType: {
      type: String,
      default: 'OPD'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
