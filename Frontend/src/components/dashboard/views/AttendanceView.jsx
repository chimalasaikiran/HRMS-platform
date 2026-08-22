import React, { useState } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHrms } from '../../../context/HrmsContext';

export const AttendanceView = () => {
  const { currentUser } = useAuth();
  const { attendanceLogs, todayDate, checkIn, checkOut } = useHrms();

  const isAdmin = currentUser?.role === 'ADMIN';

  // Admin date stepper state (default today)
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedMonth, setSelectedMonth] = useState('2025-10');
  const [searchTerm, setSearchTerm] = useState('');

  const stepDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getStatusBadge = (status) => {
    const st = (status || 'PRESENT').toUpperCase();
    if (st === 'PRESENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          PRESENT
        </span>
      );
    }
    if (st === 'ABSENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          ABSENT
        </span>
      );
    }
    if (st === 'HALF_DAY') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          HALF DAY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
        <FileCheck className="w-3 h-3 text-blue-600" />
        LEAVE
      </span>
    );
  };

  // Filter logs for Admin view (by date) vs Employee view (own logs)
  const displayLogs = isAdmin
    ? attendanceLogs.filter((a) => a.date === selectedDate && (
        a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.loginId || a.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase())
      ))
    : attendanceLogs.filter((a) => a.employeeId === currentUser?.id || a.loginId === currentUser?.loginId);

  const daysPresent = displayLogs.filter(l => (l.status || '').toUpperCase() === 'PRESENT').length;
  const leavesCount = displayLogs.filter(l => (l.status || '').toUpperCase() === 'LEAVE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            {isAdmin ? 'Admin Attendance Day-View' : 'My Monthly Attendance'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {isAdmin
              ? 'View all employees present on a chosen day with date stepper.'
              : 'Day-wise attendance records, work hours, and payable days summary.'}
          </p>
        </div>

        {isAdmin ? (
          /* Admin Date Stepper */
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#e8e2d5] shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => stepDate(-1)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-serif-title font-bold text-sm text-[#1c3541] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#b5832a]" />
              {selectedDate}
            </span>
            <button
              type="button"
              onClick={() => stepDate(1)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Employee Month Picker */
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-[#1c3541] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="2025-10">Oct 2025</option>
              <option value="2025-09">Sep 2025</option>
              <option value="2025-08">Aug 2025</option>
            </select>
          </div>
        )}
      </div>

      {/* Summary Tiles for Employee */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Days Present</div>
            <div className="font-serif-title text-2xl font-bold text-emerald-600">{daysPresent} Days</div>
            <div className="text-xs text-slate-400 mt-1">Confirmed check-ins</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Leaves Count</div>
            <div className="font-serif-title text-2xl font-bold text-sky-600">{leavesCount} Days</div>
            <div className="text-xs text-slate-400 mt-1">Approved time off</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Total Working Days</div>
            <div className="font-serif-title text-2xl font-bold text-[#1c3541]">22 Days</div>
            <div className="text-xs text-slate-400 mt-1">Standard month baseline</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <div className="text-xs text-slate-500 font-bold uppercase mb-1">Payable Days</div>
            <div className="font-serif-title text-2xl font-bold text-[#b5832a]">22.0 Days</div>
            <div className="text-xs text-slate-400 mt-1">Used for payroll calc</div>
          </div>
        </div>
      )}

      {/* Search Bar for Admin */}
      {isAdmin && (
        <div className="bg-white p-4 rounded-2xl border border-[#e8e2d5] shadow-2xs flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search employee by name or Login ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs focus:border-[#1c3541]"
            />
          </div>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
            {displayLogs.length} checked-in employees on {selectedDate}
          </span>
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e8e2d5] text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">CHECK IN</th>
                <th className="py-3 px-4">CHECK OUT</th>
                <th className="py-3 px-4">WORK HOURS</th>
                <th className="py-3 px-4">EXTRA HOURS</th>
                <th className="py-3 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3efe6]">
              {displayLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#faf6f0] transition-colors">
                  <td className="py-4 px-4 font-bold text-[#1c3541]">
                    {log.employeeName}
                    <div className="text-[10px] font-mono text-slate-400">{log.loginId || log.employeeId}</div>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-600">{log.date}</td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-800 tabular-nums">
                    {log.checkIn || '10:00'}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600 tabular-nums">
                    {log.checkOut || '19:00'}
                  </td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-800 tabular-nums">
                    {log.workHours || '09:00'}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500 tabular-nums">
                    {log.extraHours || '01:00'}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

