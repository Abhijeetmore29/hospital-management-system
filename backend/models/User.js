const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['doctor', 'staff', 'admin'],
      default: 'staff'
    },
    specialization: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: ''
    },
    staffRole: {
      type: String,
      default: ''
    },
    experience: {
      type: String,
      default: ''
    },
    qualification: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    signature: {
      type: String,
      default: ''
    },
    profilePicture: {
      type: String,
      default: ''
    },
    permissions: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function savePassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
