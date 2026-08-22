const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, default: '' },
    bankName: { type: String, default: '' },
    ifsc: { type: String, default: '' },
    pan: { type: String, default: '' },
    uan: { type: String, default: '' },
    empCode: { type: String, default: '' },
  },
  { _id: false }
);

const privateInfoSchema = new mongoose.Schema(
  {
    dateOfBirth: { type: String, default: '' },
    nationality: { type: String, default: '' },
    personalEmail: { type: String, default: '' },
    maritalStatus: { type: String, default: '' },
    gender: { type: String, default: '' },
    residingAddress: { type: String, default: '' },
    bank: { type: bankSchema, default: () => ({}) },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    about: { type: String, default: '' },
    loveAboutJob: { type: String, default: '' },
    interests: { type: String, default: '' },
    skills: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
  },
  { _id: false }
);

const salarySchema = new mongoose.Schema(
  {
    wage: { type: Number, default: 0 },
    workingDaysPerWeek: { type: Number, default: 5 },
    breakMinutes: { type: Number, default: 60 },
    hoursPerDay: { type: Number, default: 8 },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    jobPosition: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    mobile: { type: String, default: '' },
    department: { type: String, default: '' },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    location: { type: String, default: '' },
    dateOfJoining: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    resume: { type: resumeSchema, default: () => ({}) },
    privateInfo: { type: privateInfoSchema, default: () => ({}) },
    salary: { type: salarySchema, default: () => ({}) },
  },
  { timestamps: true }
);

employeeSchema.index({ companyId: 1, firstName: 1, lastName: 1 });
employeeSchema.index({ companyId: 1, email: 1 });
employeeSchema.index({ companyId: 1, department: 1 });
employeeSchema.index({ userId: 1 });

employeeSchema.virtual('name').get(function name() {
  return `${this.firstName} ${this.lastName}`.trim();
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
