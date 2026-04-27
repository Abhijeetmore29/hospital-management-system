const mongoose = require('mongoose');

const doctorPricingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    opdFee: {
      type: Number,
      default: 0,
      min: 0
    },
    ipdAcFee: {
      type: Number,
      default: 0,
      min: 0
    },
    ipdNonAcFee: {
      type: Number,
      default: 0,
      min: 0
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0
    },
    upiId: {
      type: String,
      default: '',
      trim: true
    },
    upiPayeeName: {
      type: String,
      default: '',
      trim: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorPricing', doctorPricingSchema);
