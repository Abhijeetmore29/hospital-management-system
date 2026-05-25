const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
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
      enum: ['AC', 'Non-AC', ''],
      default: ''
    },
    amount: {
      type: Number,
      default: 0
    },
    consultationFee: {
      type: Number,
      default: 0
    },
    laboratoryCharges: {
      type: Number,
      default: 0
    },
    medicineCharges: {
      type: Number,
      default: 0
    },
    additionalCharges: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'Online'],
      default: 'Cash'
    },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Cancelled'],
      default: 'Pending'
    },
    billingDate: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Billing', billingSchema);
