const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
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
    billingType: {
      type: String,
      enum: ['OPD', 'IPD'],
      required: true
    },
    roomType: {
      type: String,
      enum: ['AC', 'Non-AC']
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Bank Transfer'],
      default: 'Cash'
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Refunded'],
      default: 'Paid'
    },
    transactionId: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      default: ''
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

