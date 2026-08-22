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
  Lock,
  Camera,
  KeyRound,
  Building,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHrms } from '../../../context/HrmsContext';
import { authApi } from '../../../services/api';

export const ProfileView = ({ employeeData }) => {
  const { currentUser } = useAuth();
  const { employees, updateEmployeeProfile, updateSalaryStructure, computeSalary } = useHrms();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Target employee record
  const empRecord = employeeData || employees.find((e) => e.id === currentUser?.id || e.loginId === currentUser?.loginId) || employees[1] || currentUser || {};

  const [activeTab, setActiveTab] = useState('resume'); // resume | private | salary | security

  // Password change state
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg, setPassMsg] = useState({ text: '', isError: false });
  const [isPassLoading, setIsPassLoading] = useState(false);

  // Resume state
  const [resumeData, setResumeData] = useState({
    about: empRecord.resume?.about || 'Software engineering professional focused on building great products.',
    loveAboutJob: empRecord.resume?.loveAboutJob || 'Solving complex problems and pair programming with teammates.',
    interests: empRecord.resume?.interests || 'Open source software, reading, chess, and tech blogging.',
    skills: empRecord.resume?.skills || ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    certifications: empRecord.resume?.certifications || ['Certified Web Developer']
  });

  // Private info state
  const [privateInfo, setPrivateInfo] = useState({
    dateOfBirth: empRecord.privateInfo?.dateOfBirth || '1995-08-20',
    nationality: empRecord.privateInfo?.nationality || 'Indian',
    personalEmail: empRecord.privateInfo?.personalEmail || 'john.doe.personal@gmail.com',
    maritalStatus: empRecord.privateInfo?.maritalStatus || 'Single',
    gender: empRecord.privateInfo?.gender || 'Male',
    residingAddress: empRecord.privateInfo?.residingAddress || '742 Evergreen Terrace, Gandhinagar',
    dateOfJoining: empRecord.privateInfo?.dateOfJoining || '2022-03-01',
    accountNumber: empRecord.privateInfo?.bank?.accountNumber || '1234567890',
    bankName: empRecord.privateInfo?.bank?.bankName || 'ICICI Bank',
    ifsc: empRecord.privateInfo?.bank?.ifsc || 'ICIC0005678',
    pan: empRecord.privateInfo?.bank?.pan || 'FGHIJ5678K',
    uan: empRecord.privateInfo?.bank?.uan || '100000000001',
    empCode: empRecord.privateInfo?.bank?.empCode || empRecord.loginId || 'OIJODO20220001'
  });

  // Wage state for Admin Salary Info tab
  const [wageInput, setWageInput] = useState(empRecord.salary?.wage || 50000);
  const salaryCalc = computeSalary(wageInput);

  const [notification, setNotification] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', isError: false });

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    try {
      setIsPassLoading(true);
      await authApi.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassMsg({ text: 'Password changed successfully!', isError: false });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassMsg({ text: err.message || 'Failed to change password.', isError: true });
    } finally {
      setIsPassLoading(false);
    }
  };

  const handleSaveResume = async (e) => {
    e.preventDefault();
    await updateEmployeeProfile(empRecord.id || empRecord.loginId, { resume: resumeData }, !isAdmin);
    setNotification('Resume updated successfully!');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSavePrivate = async (e) => {
    e.preventDefault();
    await updateEmployeeProfile(
      empRecord.id || empRecord.loginId,
      {
        privateInfo: {
          ...privateInfo,
          bank: {
            accountNumber: privateInfo.accountNumber,
            bankName: privateInfo.bankName,
            ifsc: privateInfo.ifsc,
            pan: privateInfo.pan,
            uan: privateInfo.uan,
            empCode: privateInfo.empCode
          }
        }
      },
      !isAdmin
    );
    setNotification('Private Info updated successfully!');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    await updateSalaryStructure(empRecord.id || empRecord.loginId, wageInput);
    setNotification('Salary wage structure re-computed and saved!');
    setTimeout(() => setNotification(''), 3000);
  };

  const renderLockTooltip = (label) => (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" title="Only HR can edit this field">
      <Lock className="w-2.5 h-2.5" />
      <span>HR Locked</span>
    </span>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header Profile Summary */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e8e2d5] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <img
            src={empRecord.avatarUrl || empRecord.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(empRecord.name || 'User')}`}
            alt={empRecord.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#e5b869]/30 shadow-md"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="font-serif-title text-2xl font-bold text-[#1c3541]">
                {empRecord.fullName || empRecord.name || 'John Doe'}
              </h3>
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#e5b869]/20 text-[#9e701a] border border-[#e5b869]/30">
                <Shield className="w-3 h-3 mr-1" />
                {empRecord.role || 'EMPLOYEE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span>{empRecord.jobPosition || 'Software Developer'}</span>
              <span>&bull;</span>
              <span>{empRecord.department || 'Engineering'}</span>
              <span>&bull;</span>
              <span>
                Login ID: <strong className="font-mono text-[#1c3541] bg-[#faf6f0] px-1.5 py-0.5 rounded border border-[#e8e2d5]">{empRecord.loginId || 'OIJODO20220001'}</strong>
              </span>
            </p>
          </div>
        </div>

        <div className="bg-[#faf8f5] p-3.5 rounded-xl border border-[#e8e2d5] flex items-center gap-4 shrink-0 justify-around text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Company</div>
            <div className="font-bold text-[#1c3541]">{empRecord.company || 'Odoo India'}</div>
          </div>
          <div className="h-6 w-px bg-[#e8e2d5]" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Location</div>
            <div className="font-bold text-[#1c3541]">{empRecord.location || 'Gandhinagar'}</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Contract Profile Tabs */}
      <div className="border-b border-[#e8e2d5] flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('resume')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'resume'
              ? 'border-[#1c3541] text-[#1c3541] bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Resume
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('private')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'private'
              ? 'border-[#1c3541] text-[#1c3541] bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Private Info
        </button>

        {/* SALARY INFO TAB — RENDERED ONLY WHEN ADMIN */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('salary')}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'salary'
                ? 'border-[#1c3541] text-[#1c3541] bg-white rounded-t-xl'
                : 'border-transparent text-[#b5832a] hover:text-[#9e701a]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Salary Info (Admin Only)</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[#1c3541] text-[#1c3541] bg-white rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security
        </button>
      </div>

      {/* TAB CONTENT */}
      {/* 1. RESUME TAB */}
      {activeTab === 'resume' && (
        <form onSubmit={handleSaveResume} className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-5">
          <div className="border-b border-[#f3efe6] pb-3 flex items-center justify-between">
            <h4 className="font-serif-title text-lg font-bold text-[#1c3541]">
              Employee Resume & Bio
            </h4>
            <span className="text-[11px] font-semibold text-emerald-600">Editable by Employee & Admin</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">About Me</label>
              <textarea
                rows={3}
                value={resumeData.about}
                onChange={(e) => setResumeData({ ...resumeData, about: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#e8e2d5] focus:border-[#1c3541]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">What I Love About My Job</label>
              <textarea
                rows={2}
                value={resumeData.loveAboutJob}
                onChange={(e) => setResumeData({ ...resumeData, loveAboutJob: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#e8e2d5] focus:border-[#1c3541]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">My Interests & Hobbies</label>
              <input
                type="text"
                value={resumeData.interests}
                onChange={(e) => setResumeData({ ...resumeData, interests: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#e8e2d5] focus:border-[#1c3541]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : resumeData.skills}
                onChange={(e) => setResumeData({ ...resumeData, skills: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full p-3 rounded-xl border border-[#e8e2d5] focus:border-[#1c3541]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#f3efe6]">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1c3541] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#e5b869]" />
              <span>Save Resume</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. PRIVATE INFO TAB */}
      {activeTab === 'private' && (
        <form onSubmit={handleSavePrivate} className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-6">
          <div className="border-b border-[#f3efe6] pb-3 flex items-center justify-between">
            <h4 className="font-serif-title text-lg font-bold text-[#1c3541]">
              Private Information & Bank Details
            </h4>
            {!isAdmin && (
              <span className="text-[11px] font-semibold text-slate-500">
                Residing Address is editable. Sensitive identity fields are locked by HR.
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Date of Birth</label>
                {!isAdmin && renderLockTooltip('DOB')}
              </div>
              <input
                type="date"
                value={privateInfo.dateOfBirth}
                disabled={!isAdmin}
                onChange={(e) => setPrivateInfo({ ...privateInfo, dateOfBirth: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Nationality</label>
                {!isAdmin && renderLockTooltip('Nationality')}
              </div>
              <input
                type="text"
                value={privateInfo.nationality}
                disabled={!isAdmin}
                onChange={(e) => setPrivateInfo({ ...privateInfo, nationality: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Personal Email</label>
                {!isAdmin && renderLockTooltip('Personal Email')}
              </div>
              <input
                type="email"
                value={privateInfo.personalEmail}
                disabled={!isAdmin}
                onChange={(e) => setPrivateInfo({ ...privateInfo, personalEmail: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">Marital Status</label>
                {!isAdmin && renderLockTooltip('Marital Status')}
              </div>
              <input
                type="text"
                value={privateInfo.maritalStatus}
                disabled={!isAdmin}
                onChange={(e) => setPrivateInfo({ ...privateInfo, maritalStatus: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
              />
            </div>

            <div className="col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Residing Address <span className="text-emerald-600 font-semibold">(Editable)</span>
              </label>
              <input
                type="text"
                value={privateInfo.residingAddress}
                onChange={(e) => setPrivateInfo({ ...privateInfo, residingAddress: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#e8e2d5]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#f3efe6]">
            <h5 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1c3541]" />
              <span>Bank & Regulatory Accounts</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={privateInfo.bankName}
                  disabled={!isAdmin}
                  onChange={(e) => setPrivateInfo({ ...privateInfo, bankName: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={privateInfo.accountNumber}
                  disabled={!isAdmin}
                  onChange={(e) => setPrivateInfo({ ...privateInfo, accountNumber: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={privateInfo.ifsc}
                  disabled={!isAdmin}
                  onChange={(e) => setPrivateInfo({ ...privateInfo, ifsc: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">PAN No</label>
                <input
                  type="text"
                  value={privateInfo.pan}
                  disabled={!isAdmin}
                  onChange={(e) => setPrivateInfo({ ...privateInfo, pan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">UAN No</label>
                <input
                  type="text"
                  value={privateInfo.uan}
                  disabled={!isAdmin}
                  onChange={(e) => setPrivateInfo({ ...privateInfo, uan: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border ${!isAdmin ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Emp Code</label>
                <input
                  type="text"
                  value={privateInfo.empCode}
                  disabled
                  className="w-full p-2.5 rounded-xl border bg-slate-100 text-slate-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#f3efe6]">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1c3541] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#e5b869]" />
              <span>Save Private Info</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. SALARY INFO TAB (ADMIN ONLY) */}
      {activeTab === 'salary' && isAdmin && (
        <form onSubmit={handleSaveSalary} className="bg-white p-6 rounded-2xl border border-[#e5b869] shadow-md space-y-6">
          <div className="border-b border-[#f3efe6] pb-3 flex items-center justify-between">
            <div>
              <h4 className="font-serif-title text-xl font-bold text-[#1c3541]">
                Salary Engine & Structure (Admin Only)
              </h4>
              <p className="text-xs text-slate-500">
                Type one number — Wage — and all components auto-calculate instantly.
              </p>
            </div>
            <span className="text-xs font-bold text-[#b5832a] bg-[#faf6f0] px-3 py-1 rounded-full border border-[#e8e2d5]">
              Contract Rule Formula
            </span>
          </div>

          <div className="bg-[#faf8f5] p-5 rounded-2xl border border-[#e8e2d5] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1c3541] mb-1 text-sm">Monthly Wage (&rsquo;)</label>
                <input
                  type="number"
                  value={wageInput}
                  onChange={(e) => setWageInput(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border-2 border-[#1c3541] text-lg font-bold text-[#1c3541] bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Working Days / Wk</label>
                <input type="number" value={5} disabled className="w-full p-3 rounded-xl border bg-slate-100 text-slate-500 font-bold" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Hours / Day</label>
                <input type="number" value={8} disabled className="w-full p-3 rounded-xl border bg-slate-100 text-slate-500 font-bold" />
              </div>
            </div>
          </div>

          {/* Earnings Breakdown Table */}
          <div className="space-y-3">
            <h5 className="font-bold text-[#1c3541] text-sm">Earnings Breakdown</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#e8e2d5] rounded-xl overflow-hidden">
                <thead className="bg-[#faf8f5] text-slate-700 font-bold border-b border-[#e8e2d5]">
                  <tr>
                    <th className="p-3">Component</th>
                    <th className="p-3">Calculation Rule</th>
                    <th className="p-3 text-right">Amount (&rsquo;)</th>
                    <th className="p-3 text-right">% of Basic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3efe6]">
                  {salaryCalc.earnings.map((c) => (
                    <tr key={c.key} className="hover:bg-[#faf8f5]/50">
                      <td className="p-3 font-bold text-slate-800">{c.label}</td>
                      <td className="p-3 text-slate-500">{c.key === 'BASIC' ? '50% of Wage' : c.key === 'HRA' ? '50% of Basic' : c.key === 'STD' ? 'Fixed 4,167' : c.key === 'FIXED' ? 'Wage &minus; sum(above)' : '8.33% of Basic'}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">&rsquo;{c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{c.percent}%</td>
                    </tr>
                  ))}
                  <tr className="bg-[#faf8f5] font-bold text-slate-900">
                    <td className="p-3" colSpan={2}>Gross Salary (Total Earnings)</td>
                    <td className="p-3 text-right font-mono text-[#1c3541] text-sm">&rsquo;{salaryCalc.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Deductions & Net Pay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
              <h5 className="font-bold text-rose-900">Deductions</h5>
              <div className="flex justify-between py-1 border-b border-rose-100">
                <span>PF Employee (12% of Basic)</span>
                <span className="font-mono font-bold">&rsquo;{salaryCalc.deductions[0].amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-rose-100">
                <span>Professional Tax (Fixed)</span>
                <span className="font-mono font-bold">&rsquo;{salaryCalc.deductions[2].amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#1c3541] text-white flex flex-col justify-between space-y-2">
              <div className="text-xs uppercase font-bold text-slate-300">Net Take-Home Pay (Monthly)</div>
              <div className="font-serif-title text-3xl font-bold text-[#e5b869] font-mono">
                &rsquo;{salaryCalc.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-300">Recalculated live against contract salary engine</div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#f3efe6]">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#1c3541] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-[#e5b869]" />
              <span>Save Computed Salary Structure</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. SECURITY TAB */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs max-w-lg space-y-5">
          <div className="border-b border-[#f3efe6] pb-3">
            <h4 className="font-serif-title text-lg font-bold text-[#1c3541] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#1c3541]" />
              <span>Security & Change Password</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Update password for account security.
            </p>
          </div>

          {passMsg.text && (
            <div className={`p-3.5 rounded-xl border text-xs font-semibold ${passMsg.isError ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
              {passMsg.text}
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#e8e2d5] focus:border-[#1c3541]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#e8e2d5] focus:border-[#1c3541]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-[#e8e2d5] focus:border-[#1c3541]"
                required
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#f3efe6]">
            <button
              type="submit"
              disabled={isPassLoading}
              className="px-5 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              {isPassLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

