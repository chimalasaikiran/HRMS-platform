import React, { useState } from 'react';
import {
  CreditCard,
  Download,
  Lock,
  DollarSign,
  Edit3,
  Check,
  X,
  FileText,
  ShieldAlert,
  Search
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHrms } from '../../../context/HrmsContext';

export const PayrollView = () => {
  const { currentUser } = useAuth();
  const { employees, updateSalaryStructure } = useHrms();

  const isEmployee = currentUser?.role === 'Employee';
  const empId = currentUser?.employeeId || 'EMP-2025-88';

  // State for Admin Salary Structure Editing Modal
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: 0,
    hra: 0,
    allowances: 0,
    deductions: 0
  });

  const [notification, setNotification] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Find employee record
  const currentEmpRecord =
    employees.find((e) => e.employeeId === empId) || employees[0] || {};

  const handleEditSalaryClick = (emp) => {
    setEditingEmployee(emp);
    setSalaryForm({
      basicSalary: emp.basicSalary || 85000,
      hra: emp.hra || 25000,
      allowances: emp.allowances || 10000,
      deductions: emp.deductions || 8000
    });
  };

  const handleSaveSalary = (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateSalaryStructure(editingEmployee.employeeId, salaryForm);
    setEditingEmployee(null);
    setNotification(`Updated salary structure for ${editingEmployee.fullName}`);
    setTimeout(() => setNotification(''), 3000);
  };

  // Filter employees for admin list
  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            {isEmployee ? 'My Payroll & Payslips' : 'Payroll Management & Salary Structure'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {isEmployee
              ? 'View read-only breakdown of your monthly salary, compensation structure, and download payslips.'
              : 'View payroll of all employees, adjust salary structures, and manage monthly compensation accuracy.'}
          </p>
        </div>

        {isEmployee && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#faf8f5] text-slate-600 border border-[#e8e2d5]">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Read-Only Employee View</span>
          </span>
        )}
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* 3.6.1 EMPLOYEE READ-ONLY PAYROLL VIEW */}
      {isEmployee ? (
        <div className="space-y-6">
          {/* Main Net Pay Card */}
          <div className="bg-[#1c3541] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
            <div>
              <div className="text-xs uppercase font-bold text-[#e5b869] tracking-wider mb-1">
                Net Monthly Take-Home Pay
              </div>
              <div className="font-serif-title text-4xl sm:text-5xl font-bold text-white">
                $
                {Math.round(
                  ((currentEmpRecord.basicSalary || 85000) +
                    (currentEmpRecord.hra || 25000) +
                    (currentEmpRecord.allowances || 10000) -
                    (currentEmpRecord.deductions || 8000)) /
                    12
                ).toLocaleString()}{' '}
                <span className="text-base text-slate-300 font-sans font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Processed automatically via direct bank deposit on the 1st of every month.
              </p>
            </div>

            <button
              type="button"
              className="px-5 py-3 rounded-xl bg-[#e5b869] hover:bg-[#d8a755] text-[#1c3541] font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download July 2025 Payslip</span>
            </button>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-4">
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Monthly Earnings Breakdown</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex justify-between">
                  <span className="text-slate-600 font-medium">Base Salary (Annual CTC)</span>
                  <span className="font-bold text-slate-800">
                    ${(currentEmpRecord.basicSalary || 85000).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex justify-between">
                  <span className="text-slate-600 font-medium">House Rent Allowance (HRA)</span>
                  <span className="font-bold text-slate-800">
                    ${(currentEmpRecord.hra || 25000).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex justify-between">
                  <span className="text-slate-600 font-medium">Special & Transport Allowances</span>
                  <span className="font-bold text-slate-800">
                    ${(currentEmpRecord.allowances || 10000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-4">
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Deductions & Taxes</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex justify-between">
                  <span className="text-slate-600 font-medium">Provident Fund (PF)</span>
                  <span className="font-bold text-rose-600">
                    -${Math.round((currentEmpRecord.deductions || 8000) * 0.6).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex justify-between">
                  <span className="text-slate-600 font-medium">Income Tax Withholding (TDS)</span>
                  <span className="font-bold text-rose-600">
                    -${Math.round((currentEmpRecord.deductions || 8000) * 0.4).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex justify-between font-bold text-rose-800">
                  <span>Total Monthly Deductions</span>
                  <span>-${(currentEmpRecord.deductions || 8000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 3.6.2 ADMIN PAYROLL MANAGEMENT VIEW */
        <div className="space-y-6">
          {/* Admin search bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#e8e2d5] shadow-2xs flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search employee by name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs focus:border-[#1c3541]"
              />
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              {filteredEmployees.length} employee payroll records
            </span>
          </div>

          {/* All Employees Payroll Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <h3 className="font-serif-title text-xl font-bold text-[#1c3541] mb-4">
              All Employees Salary Structures
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e8e2d5] text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="py-3 px-4">EMPLOYEE</th>
                    <th className="py-3 px-4">BASIC SALARY</th>
                    <th className="py-3 px-4">HRA</th>
                    <th className="py-3 px-4">ALLOWANCES</th>
                    <th className="py-3 px-4">DEDUCTIONS</th>
                    <th className="py-3 px-4">NET MONTHLY</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3efe6] text-xs">
                  {filteredEmployees.map((emp) => {
                    const netM = Math.round(
                      ((emp.basicSalary || 85000) +
                        (emp.hra || 25000) +
                        (emp.allowances || 10000) -
                        (emp.deductions || 8000)) /
                        12
                    );
                    return (
                      <tr key={emp.employeeId} className="hover:bg-[#faf6f0] transition-colors">
                        <td className="py-4 px-4 font-bold text-[#1c3541]">
                          {emp.fullName}
                          <div className="text-[10px] font-mono text-slate-400">
                            {emp.employeeId} • {emp.department}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-700">
                          ${(emp.basicSalary || 85000).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600">
                          ${(emp.hra || 25000).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600">
                          ${(emp.allowances || 10000).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-rose-600 font-semibold">
                          -${(emp.deductions || 8000).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-600">
                          ${netM.toLocaleString()} / mo
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleEditSalaryClick(emp)}
                            className="px-3 py-1.5 rounded-lg bg-[#1c3541] hover:bg-[#28495a] text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#e5b869]" />
                            <span>Edit Structure</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN EDIT SALARY STRUCTURE MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-[#f3efe6] pb-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
                  Update Salary Structure (Admin)
                </h3>
                <p className="text-xs text-slate-500">
                  Editing payroll parameters for {editingEmployee.fullName} ({editingEmployee.employeeId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Basic Salary ($/yr)</label>
                  <input
                    type="number"
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs font-bold focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">HRA Allowance ($/yr)</label>
                  <input
                    type="number"
                    value={salaryForm.hra}
                    onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs font-bold focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Special Allowances ($/yr)</label>
                  <input
                    type="number"
                    value={salaryForm.allowances}
                    onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs font-bold focus:border-[#1c3541]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual Deductions ($/yr)</label>
                  <input
                    type="number"
                    value={salaryForm.deductions}
                    onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs font-bold focus:border-[#1c3541]"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Calculated Net Take-Home Pay:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  $
                  {Math.round(
                    ((Number(salaryForm.basicSalary) || 0) +
                      (Number(salaryForm.hra) || 0) +
                      (Number(salaryForm.allowances) || 0) -
                      (Number(salaryForm.deductions) || 0)) /
                      12
                  ).toLocaleString()} / month
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f3efe6]">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#e5b869]" />
                  <span>Update Salary Structure</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
