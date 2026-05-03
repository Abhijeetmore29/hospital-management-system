const mongoose = require('mongoose');

const imagingReportSchema = new mongoose.Schema(
  {
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalImage',
      required: true,
      unique: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    findings: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'final'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImagingReport', imagingReportSchema, 'imaging_reports');
