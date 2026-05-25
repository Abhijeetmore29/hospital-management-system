const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    opdFee: {
      type: Number,
      default: 0
    },
    ipdAcFee: {
      type: Number,
      default: 0
    },
    ipdNonAcFee: {
      type: Number,
      default: 0
    },
    upiId: {
      type: String,
      default: ''
    },
    upiPayeeName: {
      type: String,
      default: ''
    },
    bankName: {
      type: String,
      default: ''
    },
    accountHolderName: {
      type: String,
      default: ''
    },
    accountNumber: {
      type: String,
      default: ''
    },
    ifscCode: {
      type: String,
      default: ''
    },
    qrCodeUrl: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
