import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  DollarSign,
  Shield,
  Edit3,
  Check,
  X,
  Download,
  Lock,
  Camera
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHrms } from '../../../context/HrmsContext';

export const ProfileView = () => {
  const { currentUser } = useAuth();
  const { employees, updateEmployeeProfile } = useHrms();

  const isEmployee = currentUser?.role === 'Employee';

  // Find actual record from HrmsContext, fallback to currentUser
  const empRecord =
    employees.find((e) => e.employeeId === currentUser?.employeeId) || currentUser || {};

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: empRecord.fullName || 'Maya Chen',
    email: empRecord.email || 'maya.chen@dayflow.work',
    phone: empRecord.phone || '+1 (555) 234-5678',
    address: empRecord.address || '742 Evergreen Terrace, Springfield',
    avatar: empRecord.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    department: empRecord.department || 'Engineering',
    jobTitle: empRecord.jobTitle || 'Senior Engineer',
    role: empRecord.role || 'Employee'
  });

  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateEmployeeProfile(empRecord.employeeId || 'EMP-2025-88', formData, isEmployee);
    setIsEditing(false);
    setSaveSuccessMessage('Profile details updated successfully!');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  // Salary calculations
  const basic = Number(empRecord.basicSalary || 85000);
  const hra = Number(empRecord.hra || 25000);
  const allowances = Number(empRecord.allowances || 10000);
  const deductions = Number(empRecord.deductions || 8000);
  const grossMonthly = Math.round((basic + hra + allowances) / 12);
  const netMonthly = Math.round((basic + hra + allowances - deductions) / 12);

  const documentsList = empRecord.documents || [
    { name: 'Government_ID.pdf', date: 'Jan 15, 2024', size: '1.2 MB' },
    { name: 'Employment_Contract.pdf', date: 'Jan 15, 2024', size: '2.4 MB' },
    { name: 'July_2025_Payslip.pdf', date: 'Aug 01, 2025', size: '340 KB' }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            Employee Profile & Account
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            View personal details, job role, salary structure, documents, and manage contact settings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-xs cursor-pointer ${
            isEditing
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-[#1c3541] hover:bg-[#28495a] text-white'
          }`}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              <span>Cancel Editing</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 text-[#e5b869]" />
              <span>{isEmployee ? 'Edit Contact & Picture' : 'Edit Profile Details'}</span>
            </>
          )}
        </button>
      </div>

      {/* Success notification banner */}
      {saveSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* 3.3.1 VIEW & EDIT PROFILE HEADER CARD */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e8e2d5] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={formData.avatar || empRecord.avatar}
              alt={empRecord.fullName}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[#e5b869]/30 shadow-md"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white cursor-pointer opacity-90">
                <Camera className="w-6 h-6" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#1c3541]">
                {empRecord.fullName || 'Alex Morgan'}
              </h3>
              <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#e5b869]/20 text-[#9e701a] border border-[#e5b869]/30">
                <Shield className="w-3 h-3 mr-1" />
                {empRecord.role || 'Employee'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-3 flex-wrap">
              <span>{empRecord.jobTitle || 'Frontend Engineer'}</span>
              <span>•</span>
              <span>{empRecord.department || 'Engineering'}</span>
              <span>•</span>
              <span>
                Employee ID: <strong className="font-mono text-[#1c3541]">{empRecord.employeeId || 'EMP-2025-88'}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e8e2d5] flex items-center gap-4 shrink-0 justify-around sm:justify-start">
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Joined</div>
            <div className="text-xs font-bold text-[#1c3541]">{empRecord.joinedDate || 'Mar 2024'}</div>
          </div>
          <div className="h-8 w-px bg-[#e8e2d5]" />
          <div className="text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
            <div className="text-xs font-bold text-emerald-600">Active</div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM MODAL / PANEL */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e5b869]/50 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#f3efe6] pb-4">
            <div>
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
                {isEmployee ? 'Edit Contact & Profile Picture (3.3.2)' : 'Edit All Employee Fields (Admin Mode)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEmployee
                  ? 'Employees can edit limited fields (address, phone, profile picture).'
                  : 'Admins can edit all employee details.'}
              </p>
            </div>
            {isEmployee && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Job & Role locked by Admin</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={isEmployee}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isEmployee ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-white border-[#e8e2d5] focus:border-[#1c3541]'
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isEmployee}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isEmployee ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-white border-[#e8e2d5] focus:border-[#1c3541]'
                }`}
              />
            </div>

            {/* Phone (ALLOWED FOR EMPLOYEE) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-emerald-600 font-semibold">(Editable)</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] bg-white text-slate-800 text-xs font-medium focus:border-[#1c3541]"
                required
              />
            </div>

            {/* Address (ALLOWED FOR EMPLOYEE) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Home Address <span className="text-emerald-600 font-semibold">(Editable)</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] bg-white text-slate-800 text-xs font-medium focus:border-[#1c3541]"
                required
              />
            </div>

            {/* Profile Picture URL (ALLOWED FOR EMPLOYEE) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Profile Picture Avatar URL <span className="text-emerald-600 font-semibold">(Editable)</span>
              </label>
              <input
                type="url"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] bg-white text-slate-800 text-xs font-medium focus:border-[#1c3541]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#f3efe6]">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#e5b869]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : null}

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PERSONAL & JOB DETAILS */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-4">
          <h4 className="font-serif-title text-xl font-bold text-[#1c3541] flex items-center gap-2">
            <User className="w-5 h-5 text-[#b5832a]" />
            <span>Personal & Job Details</span>
          </h4>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Full Name
              </span>
              <span className="font-bold text-slate-800">{empRecord.fullName}</span>
            </div>

            <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" /> Email Address
              </span>
              <span className="font-bold text-slate-800">{empRecord.email}</span>
            </div>

            <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Phone Number
              </span>
              <span className="font-bold text-slate-800">{formData.phone}</span>
            </div>

            <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Home Address
              </span>
              <span className="font-bold text-slate-800 truncate max-w-xs">{formData.address}</span>
            </div>

            <div className="p-3.5 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex items-center justify-between">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> Department & Role
              </span>
              <span className="font-bold text-slate-800">
                {empRecord.department} ({empRecord.jobTitle})
              </span>
            </div>
          </div>
        </div>

        {/* SALARY STRUCTURE (READ-ONLY FOR EMPLOYEE) */}
        <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title text-xl font-bold text-[#1c3541] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Salary Structure</span>
            </h4>
            <span className="text-[10px] font-bold bg-[#faf8f5] text-slate-500 px-2.5 py-1 rounded-full border border-[#e8e2d5] flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Read-Only
            </span>
          </div>

          <div className="p-4 bg-[#1c3541] text-white rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-300">Net Take-Home Pay</div>
              <div className="font-serif-title text-2xl font-bold text-[#e5b869]">
                ${netMonthly.toLocaleString()} / mo
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-300">Annual CTC</div>
              <div className="text-sm font-bold text-white">
                ${(basic + hra + allowances).toLocaleString()} / yr
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-[#f3efe6] text-slate-600">
              <span>Basic Salary</span>
              <span className="font-bold text-slate-800">${basic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3efe6] text-slate-600">
              <span>House Rent Allowance (HRA)</span>
              <span className="font-bold text-slate-800">${hra.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#f3efe6] text-slate-600">
              <span>Special & Medical Allowances</span>
              <span className="font-bold text-slate-800">${allowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-rose-600 font-medium">
              <span>Standard Deductions (PF & Tax)</span>
              <span className="font-bold">-${deductions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENTS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
        <h4 className="font-serif-title text-xl font-bold text-[#1c3541] mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#1c3541]" />
          <span>Employee Documents</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {documentsList.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#faf8f5] border border-[#e8e2d5] hover:border-[#d4c8b0] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#1c3541]/10 text-[#1c3541] flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#1c3541] truncate">{doc.name}</div>
                  <div className="text-[10px] text-slate-400">{doc.date} • {doc.size}</div>
                </div>
              </div>

              <button
                type="button"
                className="p-2 text-slate-500 hover:text-[#1c3541] hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
                title="Download document"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
