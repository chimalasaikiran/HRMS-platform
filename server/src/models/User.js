const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    loginId: { type: String, required: true, unique: true, uppercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], required: true },
    mustChangePassword: { type: Boolean, default: false },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  },
  { timestamps: true }
);

userSchema.index({ companyId: 1, role: 1 });

module.exports = mongoose.model('User', userSchema);
