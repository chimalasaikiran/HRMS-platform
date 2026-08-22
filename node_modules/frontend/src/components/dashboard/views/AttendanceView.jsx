import React, { useState } from 'react';
import {
  Clock,
  Calendar as CalendarIcon,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Search
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHrms } from '../../../context/HrmsContext';

export const AttendanceView = () => {
  const { currentUser } = useAuth();
  const { attendanceLogs, todayDate, checkIn, checkOut, updateAttendanceStatus } = useHrms();

  const isEmployee = currentUser?.role === 'Employee';
  const empId = currentUser?.employeeId || 'EMP-2025-88';

  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'weekly'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Find today's log for logged in user
  const todayAttendance = attendanceLogs.find(
    (a) => a.employeeId === empId && a.date === todayDate
  );

  const isCheckedIn = !!todayAttendance?.checkIn;
  const isCheckedOut = !!todayAttendance?.checkOut;

  // Filter logs by access role
  const scopedLogs = isEmployee
    ? attendanceLogs.filter((a) => a.employeeId === empId)
    : attendanceLogs;

  // Search and status filtering
  const filteredLogs = scopedLogs.filter((log) => {
    const matchesSearch =
      log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Present
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Absent
          </span>
        );
      case 'Half-day':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Half-day
          </span>
        );
      case 'Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <FileCheck className="w-3 h-3 text-blue-600" />
            Leave
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title text-3xl font-bold text-[#1c3541]">
            {isEmployee ? 'My Attendance Tracking' : 'Company Attendance & Stream'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {isEmployee
              ? 'View your personal clock-in records, shift hours, and weekly presence.'
              : 'Track daily clock-ins, shift hours, and employee attendance statuses company-wide.'}
          </p>
        </div>

        {/* Daily / Weekly View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#e8e2d5] shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'daily'
                ? 'bg-[#1c3541] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-[#1c3541] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Summary
          </button>
        </div>
      </div>

      {/* CHECK-IN / CHECK-OUT INTERACTIVE BAR FOR LOGGED-IN EMPLOYEE */}
      <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e5b869]/20 text-[#b5832a] flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shift Clock Status ({todayDate})
            </div>
            <div className="text-base font-bold text-[#1c3541] mt-0.5 flex items-center gap-2">
              {isCheckedOut ? (
                <span className="text-slate-600">Checked Out at {todayAttendance.checkOut}</span>
              ) : isCheckedIn ? (
                <span className="text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Checked In at {todayAttendance.checkIn} (Active Shift)
                </span>
              ) : (
                <span className="text-amber-600">Not checked in for today yet</span>
              )}
            </div>
          </div>
        </div>

        {!isCheckedOut && (
          <div className="flex items-center gap-3">
            {!isCheckedIn ? (
              <button
                type="button"
                onClick={() => checkIn(currentUser)}
                className="px-5 py-2.5 rounded-xl bg-[#e5b869] hover:bg-[#d8a755] text-[#1c3541] font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Clock In Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => checkOut(currentUser)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Clock Out Now</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Average Check-in</div>
          <div className="font-serif-title text-2xl font-bold text-[#1c3541]">09:02 AM</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">98% On-time Rate</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Shift Duration</div>
          <div className="font-serif-title text-2xl font-bold text-[#1c3541]">8.5 Hours</div>
          <div className="text-xs text-slate-500 mt-1">Standard baseline</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Present Status</div>
          <div className="font-serif-title text-2xl font-bold text-emerald-600">
            {scopedLogs.filter((l) => l.status === 'Present').length} Days
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Recorded</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Approved Leaves</div>
          <div className="font-serif-title text-2xl font-bold text-[#b5832a]">
            {scopedLogs.filter((l) => l.status === 'Leave').length} Days
          </div>
          <div className="text-xs text-slate-500 mt-1">Scheduled</div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR (ADMIN / HR FILTERING) */}
      {!isEmployee && (
        <div className="bg-white p-4 rounded-2xl border border-[#e8e2d5] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#faf8f5] border border-[#e8e2d5] rounded-xl text-xs focus:border-[#1c3541]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {['all', 'Present', 'Absent', 'Half-day', 'Leave'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#1c3541] text-white'
                    : 'bg-[#faf8f5] text-slate-600 hover:bg-[#f3efe6]'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ATTENDANCE TABLE */}
      <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif-title text-xl font-bold text-[#1c3541]">
            {isEmployee ? 'My Attendance History' : 'Employee Attendance Directory'}
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {filteredLogs.length} records found
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e8e2d5] text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <th className="py-3 px-4">EMPLOYEE</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">CHECK IN</th>
                <th className="py-3 px-4">CHECK OUT</th>
                <th className="py-3 px-4">WORK HOURS</th>
                <th className="py-3 px-4 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3efe6] text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#faf6f0] transition-colors">
                  <td className="py-4 px-4 font-bold text-[#1c3541]">
                    {log.employeeName}
                    <div className="text-[10px] font-mono text-slate-400">{log.employeeId}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{log.date}</td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-700">
                    {log.checkIn || '—'}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600">
                    {log.checkOut || '—'}
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{log.workHours}</td>
                  <td className="py-4 px-4 text-right">
                    {!isEmployee ? (
                      /* Admin status dropdown */
                      <select
                        value={log.status}
                        onChange={(e) => updateAttendanceStatus(log.id, e.target.value)}
                        className="text-xs font-bold rounded-lg border border-[#e8e2d5] px-2 py-1 bg-white cursor-pointer"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Half-day">Half-day</option>
                        <option value="Leave">Leave</option>
                      </select>
                    ) : (
                      getStatusBadge(log.status)
                    )}
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
