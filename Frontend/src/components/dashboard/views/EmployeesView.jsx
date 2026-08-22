import React, { useState } from 'react';
import { Search, Plus, Mail, Building, Filter, Edit3, X, Check, Shield, Copy } from 'lucide-react';
import { useHrms } from '../../../context/HrmsContext';
import { useAuth } from '../../../context/AuthContext';

export const EmployeesView = ({ onSelectEmployee }) => {
  const { employees, createEmployee, updateEmployeeProfile } = useHrms();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createdResultModal, setCreatedResultModal] = useState(null);

  const [newEmpForm, setNewEmpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '+91 9000000000',
    jobPosition: 'Software Developer',
    department: 'Engineering',
    manager: 'Hari Admin',
    location: 'Gandhinagar',
    dateOfJoining: new Date().toISOString().split('T')[0]
  });

  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    jobPosition: '',
    mobile: '',
    location: ''
  });

  const [notification, setNotification] = useState('');

  const [modalError, setModalError] = useState('');

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await createEmployee(newEmpForm);
      setIsAddModalOpen(false);
      setCreatedResultModal({
        name: `${newEmpForm.firstName} ${newEmpForm.lastName}`,
        loginId: res.loginId,
        tempPassword: res.tempPassword
      });
      setNewEmpForm({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '+91 9000000000',
        jobPosition: 'Software Developer',
        department: 'Engineering',
        manager: 'Hari Admin',
        location: 'Gandhinagar',
        dateOfJoining: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setModalError(err.message || 'Failed to create employee account. Please check inputs.');
    }
  };

  const handleEditClick = (emp) => {
    setEditingEmp(emp);
    setEditForm({
      name: emp.fullName || emp.name || '',
      email: emp.email || '',
      role: emp.role || 'EMPLOYEE',
      department: emp.department || 'Engineering',
      jobPosition: emp.jobPosition || 'Developer',
      mobile: emp.mobile || '',
      location: emp.location || 'Gandhinagar'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingEmp) return;
    await updateEmployeeProfile(editingEmp.id || editingEmp.loginId, editForm, !isAdmin);
    setEditingEmp(null);
    setNotification(`Updated profile for ${editForm.name}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredEmployees = employees.filter((emp) => {
    const empName = emp.fullName || emp.name || '';
    const empIdStr = emp.loginId || emp.employeeId || emp.id || '';
    const matchesSearch =
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.jobPosition || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      empIdStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const renderStatusBadge = (status) => {
    const st = (status || 'PRESENT').toUpperCase();
    if (st === 'PRESENT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-soft" />
          <span>Present</span>
        </span>
      );
    }
    if (st === 'ON_LEAVE' || st === 'LEAVE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
          <span>✈️</span>
          <span>On Leave</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span>Absent</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            Employees Grid
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Live status dots: 🟢 Present &middot; ✈️ On Leave &middot; 🟡 Absent
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#e5b869]" />
            <span>NEW Employee</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e8e2d5] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, Login ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#faf8f5] border border-[#e8e2d5] focus:outline-none focus:border-[#1c3541] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-[#faf8f5] border border-[#e8e2d5] focus:outline-none focus:border-[#1c3541] text-slate-700 font-semibold cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">All Departments</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Engineering">Engineering</option>
            <option value="Finance">Finance</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Grid of Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => {
          const empName = emp.fullName || emp.name || 'Teammate';
          const loginId = emp.loginId || emp.employeeId || 'OIJODO20220001';
          return (
            <div
              key={emp.id || loginId}
              onClick={() => onSelectEmployee && onSelectEmployee(emp)}
              className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-xs card-lift flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatarUrl || emp.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(empName)}`}
                      alt={empName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#e5b869]/30 shrink-0 shadow-xs"
                    />
                    <div>
                      <h3 className="font-bold text-[#1c3541] text-base group-hover:text-[#b5832a] transition-colors">
                        {empName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {emp.jobPosition || emp.role}
                      </p>
                    </div>
                  </div>
                  {renderStatusBadge(emp.status)}
                </div>

                <div className="space-y-2 border-t border-[#f3efe6] pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f3efe6] flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 text-[11px] font-semibold bg-[#faf6f0] px-2 py-0.5 rounded border border-[#e8e2d5]">
                  {loginId}
                </span>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(emp);
                    }}
                    className="px-3 py-1 rounded-lg bg-[#1c3541] hover:bg-[#28495a] text-white text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-[#e5b869]" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW EMPLOYEE MODAL (ADMIN ONLY) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-[#f3efe6] pb-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
                  Create New Employee
                </h3>
                <p className="text-xs text-slate-500">
                  Login ID will auto-generate in contract format (e.g. OIJODO20220001)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️ {modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newEmpForm.firstName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                    placeholder="John"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newEmpForm.lastName}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                    placeholder="Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmpForm.email}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                    placeholder="john.doe@dayflow.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={newEmpForm.mobile}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Position</label>
                  <input
                    type="text"
                    value={newEmpForm.jobPosition}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, jobPosition: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newEmpForm.department}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newEmpForm.location}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Joining</label>
                  <input
                    type="date"
                    value={newEmpForm.dateOfJoining}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, dateOfJoining: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f3efe6]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#e5b869]" />
                  <span>Generate Employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATED CREDENTIALS MODAL */}
      {createdResultModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 animate-fade-in space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
                Employee Created!
              </h3>
              <p className="text-xs text-slate-500">
                Share these generated credentials with {createdResultModal.name}
              </p>
            </div>

            <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e8e2d5] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Login ID:</span>
                <span className="font-bold text-[#1c3541] text-sm">{createdResultModal.loginId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Temp Password:</span>
                <span className="font-bold text-[#b5832a] text-sm">{createdResultModal.tempPassword}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCreatedResultModal(null)}
              className="w-full py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3efe6] pb-3">
              <h3 className="font-serif-title text-lg font-bold text-[#1c3541]">
                Edit Employee Profile
              </h3>
              <button type="button" onClick={() => setEditingEmp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Position</label>
                <input
                  type="text"
                  value={editForm.jobPosition}
                  onChange={(e) => setEditForm({ ...editForm, jobPosition: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#1c3541] text-white font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

