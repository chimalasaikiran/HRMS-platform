const mongoose = require('mongoose');

const timeOffSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['PAID', 'SICK', 'UNPAID'], required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: { type: Number, required: true },
    reason: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewComment: { type: String, default: '' },
  },
  { timestamps: true }
);

timeOffSchema.index({ employeeId: 1, status: 1 });
timeOffSchema.index({ companyId: 1, status: 1, createdAt: -1 });
timeOffSchema.index({ companyId: 1, status: 1, startDate: 1, endDate: 1 });
timeOffSchema.index({ employeeId: 1, status: 1, type: 1 });

module.exports = mongoose.model('TimeOffRequest', timeOffSchema);
