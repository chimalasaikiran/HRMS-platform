import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  DollarSign,
  Edit3,
  Check,
  X,
  ShieldAlert,
  Search
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHrms } from '../../../context/HrmsContext';

export const PayrollView = () => {
  const { currentUser } = useAuth();
  const { employees, updateSalaryStructure, computeSalary } = useHrms();

  const isAdmin = currentUser?.role === 'ADMIN';
  const myRecord = employees.find((e) => e.id === currentUser?.id || e.loginId === currentUser?.loginId) || employees[1] || {};

  const [editingEmp, setEditingEmp] = useState(null);
  const [wageInput, setWageInput] = useState(50000);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState('');

  const handleEditSalaryClick = (emp) => {
    setEditingEmp(emp);
    setWageInput(emp.salary?.wage || 50000);
  };

  const handleSaveWage = async (e) => {
    e.preventDefault();
    if (!editingEmp) return;

    await updateSalaryStructure(editingEmp.id || editingEmp.loginId, wageInput);
    setEditingEmp(null);
    setNotification(`Updated wage for ${editingEmp.fullName || editingEmp.name}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const filteredEmployees = employees.filter((e) => {
    const nameStr = e.fullName || e.name || '';
    const idStr = e.loginId || e.employeeId || e.id || '';
    return (
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const empSalaryCalc = computeSalary(myRecord.salary?.wage || 50000);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            {isAdmin ? 'Payroll & Salary Engine' : 'My Payroll & Salary Structure'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {isAdmin
              ? 'Admin single-number Wage input computes all components instantly via contract rules.'
              : 'Read-only breakdown of your monthly compensation, earnings, and deductions.'}
          </p>
        </div>

        {!isAdmin && (
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

      {/* NON-ADMIN EMPLOYEE PAYROLL VIEW */}
      {!isAdmin ? (
        <div className="space-y-6">
          <div className="bg-[#1c3541] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
            <div>
              <div className="text-xs uppercase font-bold text-[#e5b869] tracking-wider mb-1">
                Net Take-Home Pay (Monthly)
              </div>
              <div className="font-serif-title text-4xl sm:text-5xl font-bold text-white font-mono">
                &rsquo;{empSalaryCalc.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Monthly Wage: &rsquo;{empSalaryCalc.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })} &bull; Direct bank deposit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-4">
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span>Earnings Breakdown</span>
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {empSalaryCalc.earnings.map((c) => (
                  <div key={c.key} className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex justify-between">
                    <span className="text-slate-600 font-sans font-medium">{c.label}</span>
                    <span className="font-bold text-slate-800">&rsquo;{c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs space-y-4">
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Deductions & Taxes</span>
              </h3>
              <div className="space-y-2 text-xs font-mono">
                {empSalaryCalc.deductions.map((d) => (
                  <div key={d.key} className="p-3 bg-[#faf8f5] rounded-xl border border-[#e8e2d5] flex justify-between">
                    <span className="text-slate-600 font-sans font-medium">{d.label}</span>
                    <span className="font-bold text-rose-600">
                      -&rsquo;{d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN PAYROLL MANAGEMENT VIEW */
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-[#e8e2d5] shadow-2xs flex items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search employee name, Login ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs focus:border-[#1c3541]"
              />
            </div>
            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
              {filteredEmployees.length} employee records
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <h3 className="font-serif-title text-xl font-bold text-[#1c3541] mb-4">
              All Employee Salary Structures
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e8e2d5] text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="py-3 px-4">EMPLOYEE</th>
                    <th className="py-3 px-4">MONTHLY WAGE</th>
                    <th className="py-3 px-4">BASIC (50%)</th>
                    <th className="py-3 px-4">HRA (50%)</th>
                    <th className="py-3 px-4">FIXED ALLOWANCE</th>
                    <th className="py-3 px-4">NET PAYABLE</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3efe6]">
                  {filteredEmployees.map((emp) => {
                    const empName = emp.fullName || emp.name || 'Teammate';
                    const empLoginId = emp.loginId || emp.employeeId || 'OIJODO20220001';
                    const c = computeSalary(emp.salary?.wage || 50000);

                    return (
                      <tr key={emp.id || empLoginId} className="hover:bg-[#faf6f0] transition-colors">
                        <td className="py-4 px-4 font-bold text-[#1c3541]">
                          {empName}
                          <div className="text-[10px] font-mono text-slate-400">
                            {empLoginId} &bull; {emp.department}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-slate-800">
                          &rsquo;{c.wage.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600">
                          &rsquo;{c.earnings[0].amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600">
                          &rsquo;{c.earnings[1].amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600">
                          &rsquo;{c.earnings[5].amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 font-bold text-emerald-600 font-mono">
                          &rsquo;{c.netPay.toLocaleString()} / mo
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleEditSalaryClick(emp)}
                            className="px-3 py-1.5 rounded-lg bg-[#1c3541] hover:bg-[#28495a] text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#e5b869]" />
                            <span>Set Wage</span>
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

      {/* ADMIN EDIT WAGE MODAL */}
      {editingEmp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl border border-[#e8e2d5] shadow-2xl p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="flex items-center justify-between border-b border-[#f3efe6] pb-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
                  Set Employee Wage (Admin)
                </h3>
                <p className="text-xs text-slate-500">
                  Setting wage for {editingEmp.fullName || editingEmp.name} ({editingEmp.loginId})
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

            <form onSubmit={handleSaveWage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Wage Amount (&rsquo;)
                </label>
                <input
                  type="number"
                  value={wageInput}
                  onChange={(e) => setWageInput(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#1c3541] font-mono font-bold text-lg text-[#1c3541] focus:outline-none"
                  required
                />
              </div>

              {/* Instant calculation summary preview */}
              {(() => {
                const c = computeSalary(wageInput);
                return (
                  <div className="bg-[#faf8f5] p-4 rounded-xl border border-[#e8e2d5] space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Basic (50%):</span>
                      <span className="font-bold text-slate-800">&rsquo;{c.earnings[0].amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">HRA (50% Basic):</span>
                      <span className="font-bold text-slate-800">&rsquo;{c.earnings[1].amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-slate-600">Fixed Balancing Allowance:</span>
                      <span className="font-bold text-slate-800">&rsquo;{c.earnings[5].amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#e8e2d5] font-bold text-emerald-600 text-sm">
                      <span className="font-sans">Computed Net Take-Home:</span>
                      <span>&rsquo;{c.netPay.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#f3efe6]">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-[#e5b869]" />
                  <span>Save Wage & Recompute</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

