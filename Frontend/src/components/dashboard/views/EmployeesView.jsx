import React, { useState } from 'react';
import { Search, Plus, Mail, Building, Filter, Edit3, X, Check, Shield } from 'lucide-react';
import { useHrms } from '../../../context/HrmsContext';

export const EmployeesView = () => {
  const { employees, updateEmployeeProfile } = useHrms();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const [editingEmp, setEditingEmp] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
    jobTitle: '',
    phone: '',
    address: ''
  });

  const [notification, setNotification] = useState('');

  const handleEditClick = (emp) => {
    setEditingEmp(emp);
    setEditForm({
      fullName: emp.fullName || '',
      email: emp.email || '',
      role: emp.role || 'Employee',
      department: emp.department || 'Engineering',
      jobTitle: emp.jobTitle || 'Engineer',
      phone: emp.phone || '',
      address: emp.address || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingEmp) return;

    // False for isSelfEdit so Admin gets full permission to edit all fields
    updateEmployeeProfile(editingEmp.employeeId, editForm, false);
    setEditingEmp(null);
    setNotification(`Updated details for ${editForm.fullName}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      departmentFilter === 'ALL' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            Company Employee Directory
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Admin Management: View, search, and edit employee details, roles, and departments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const newEmpId = 'EMP-2025-' + Math.floor(100 + Math.random() * 900);
            handleEditClick({
              employeeId: newEmpId,
              fullName: 'New Teammate',
              email: `teammate.${Math.floor(Math.random() * 1000)}@dayflow.work`,
              role: 'Employee',
              department: 'Engineering',
              jobTitle: 'Junior Developer',
              phone: '+1 (555) 000-0000',
              address: 'City Center Office'
            });
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-semibold text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#e5b869]" />
          <span>Add New Employee</span>
        </button>
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
            placeholder="Search by name, ID, email or role..."
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
            <option value="People Operations">People Operations</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Product">Product</option>
          </select>
        </div>
      </div>

      {/* Grid of Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.employeeId}
            className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emp.fullName)}`}
                    alt={emp.fullName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#e5b869]/30 shrink-0 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-[#1c3541] text-base">
                      {emp.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {emp.jobTitle || emp.role}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {emp.status || 'Active'}
                </span>
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
                <div className="flex items-center gap-2 text-[#b5832a] font-semibold text-[11px]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Role: {emp.role}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f3efe6] flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 text-[11px]">{emp.employeeId}</span>
              <button
                type="button"
                onClick={() => handleEditClick(emp)}
                className="px-3 py-1.5 rounded-lg bg-[#1c3541] hover:bg-[#28495a] text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#e5b869]" />
                <span>Edit All Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN EDIT EMPLOYEE MODAL */}
      {editingEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-[#f3efe6] pb-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
                  Edit Employee Details (Admin 3.3.2)
                </h3>
                <p className="text-xs text-slate-500">
                  Modifying full profile record for ID: {editingEmp.employeeId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  >
                    <option value="Employee">Employee</option>
                    <option value="HR / People team">HR / People team</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="People Operations">People Operations</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Home Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#e8e2d5] text-xs font-semibold focus:border-[#1c3541]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f3efe6]">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#e5b869]" />
                  <span>Save Full Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
