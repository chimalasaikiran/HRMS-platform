const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkIn: { type: String, default: null },
    checkOut: { type: String, default: null },
    workMinutes: { type: Number, default: 0 },
    extraMinutes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ companyId: 1, date: 1 });
attendanceSchema.index({ companyId: 1, employeeId: 1, date: 1 });

module.exports = mongoose.model('AttendanceRecord', attendanceSchema);
