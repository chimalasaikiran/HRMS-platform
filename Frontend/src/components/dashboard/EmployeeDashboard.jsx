import React, { useState } from 'react';
import {
  User,
  Clock,
  Calendar,
  LogOut,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  FileText,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHrms } from '../../context/HrmsContext';

export const EmployeeDashboard = ({ onNavigate, onApplyLeaveClick }) => {
  const { currentUser, logout } = useAuth();
  const { attendanceLogs, leaveRequests, activities, todayDate, checkIn, checkOut } = useHrms();

  const [isProcessingClock, setIsProcessingClock] = useState(false);

  // Find today's attendance for the logged in employee
  const empId = currentUser?.employeeId || 'EMP-2025-88';
  const todayAttendance = attendanceLogs.find(
    (a) => a.employeeId === empId && a.date === todayDate
  );

  const isCheckedIn = !!todayAttendance?.checkIn;
  const isCheckedOut = !!todayAttendance?.checkOut;

  // Filter leave requests for logged in employee
  const myLeaves = leaveRequests.filter((l) => l.employeeId === empId);
  const pendingLeavesCount = myLeaves.filter((l) => l.status === 'Pending').length;

  // Filter activities for logged in employee or broadcast to all
  const myActivities = activities.filter(
    (act) => act.forUser === empId || act.forUser === 'all'
  );

  const handleClockAction = () => {
    setIsProcessingClock(true);
    setTimeout(() => {
      if (!isCheckedIn) {
        checkIn(currentUser);
      } else if (!isCheckedOut) {
        checkOut(currentUser);
      }
      setIsProcessingClock(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Employee Greeting Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1c3541] via-[#244555] to-[#162b35] p-6 sm:p-8 text-white shadow-lg border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5b869]/20 text-[#e5b869] border border-[#e5b869]/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Employee Portal</span>
            </div>
            <h1 className="font-serif-title text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Welcome back, {currentUser?.fullName || 'Teammate'}!
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Access your personal workspace, track shift hours, submit leave applications, and view payroll details.
            </p>
          </div>

          {/* Clock In / Out Quick Pill Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between gap-4 shrink-0 sm:min-w-[260px]">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Today's Status
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                {isCheckedOut ? (
                  <span className="text-slate-300">Shift Completed ({todayAttendance?.checkOut})</span>
                ) : isCheckedIn ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Checked In ({todayAttendance?.checkIn})
                  </span>
                ) : (
                  <span className="text-amber-300 font-medium">Not Checked In</span>
                )}
              </div>
            </div>

            {!isCheckedOut && (
              <button
                type="button"
                onClick={handleClockAction}
                disabled={isProcessingClock}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCheckedIn
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-[#e5b869] hover:bg-[#d8a755] text-[#1c3541]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{isCheckedIn ? 'Check Out' : 'Check In'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QUICK ACCESS CARDS SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif-title text-xl font-bold text-[#1c3541] tracking-tight">
            Quick Access Workspace
          </h2>
          <span className="text-xs text-slate-500 font-medium">4 Core Features</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. PROFILE QUICK CARD */}
          <div className="group bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs hover:shadow-md hover:border-[#d4c8b0] transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-[#1c3541] absolute top-0 left-0" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#1c3541]/10 text-[#1c3541] flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#1c3541] group-hover:text-[#b5832a] transition-colors">
                Profile
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Personal & job details, documents, and contact settings.
              </p>
              <div className="mt-3 pt-3 border-t border-[#f3efe6] flex items-center justify-between text-xs font-mono text-slate-500">
                <span>ID: {empId}</span>
                <span className="font-sans font-medium text-slate-400">100% Complete</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#1c3541] hover:text-white text-[#1c3541] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#e8e2d5]"
            >
              <span>View & Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. ATTENDANCE QUICK CARD */}
          <div className="group bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs hover:shadow-md hover:border-[#d4c8b0] transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-[#e5b869] absolute top-0 left-0" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#e5b869]/20 text-[#b5832a] flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5b869]/20 text-[#9e701a]">
                  Daily Log
                </span>
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#1c3541] group-hover:text-[#b5832a] transition-colors">
                Attendance
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Track daily check-ins, shift hours, and view weekly logs.
              </p>
              <div className="mt-3 pt-3 border-t border-[#f3efe6] text-xs text-slate-600 font-medium">
                {isCheckedIn ? (
                  <span className="text-emerald-600 font-bold">Checked in today at {todayAttendance.checkIn}</span>
                ) : (
                  <span className="text-amber-600 font-medium">Ready for Check-in</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('attendance')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#1c3541] hover:text-white text-[#1c3541] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#e8e2d5]"
            >
              <span>View Attendance Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. LEAVE REQUESTS QUICK CARD */}
          <div className="group bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs hover:shadow-md hover:border-[#d4c8b0] transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-[#2a9d8f] absolute top-0 left-0" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                {pendingLeavesCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {pendingLeavesCount} Pending
                  </span>
                )}
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#1c3541] group-hover:text-[#b5832a] transition-colors">
                Leave Requests
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Submit time-off applications & check leave approval status.
              </p>
              <div className="mt-3 pt-3 border-t border-[#f3efe6] flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Paid Balance: 18 Days</span>
                <span className="text-[#2a9d8f]">10 Sick</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leave')}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#1c3541] hover:text-white text-[#1c3541] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#e8e2d5]"
            >
              <span>Manage & Apply Leave</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. LOGOUT QUICK CARD */}
          <div className="group bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="w-1.5 h-full bg-rose-500 absolute top-0 left-0" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  Session Active
                </span>
              </div>
              <h3 className="font-serif-title text-lg font-bold text-[#1c3541] group-hover:text-rose-600 transition-colors">
                Logout
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Securely sign out of your account session on this device.
              </p>
              <div className="mt-3 pt-3 border-t border-[#f3efe6] text-xs text-slate-400">
                Encrypted Session
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY OR ALERTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity & Notification Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e5b869]/20 text-[#b5832a] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-title text-lg font-bold text-[#1c3541]">
                  Recent Activity & Alerts
                </h3>
                <p className="text-xs text-slate-500">Live notifications, approval updates & company notices</p>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-[#faf8f5] border border-[#e8e2d5] px-2.5 py-1 rounded-full text-slate-600">
              {myActivities.length} items
            </span>
          </div>

          <div className="space-y-4">
            {myActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No recent activity alerts found.
              </div>
            ) : (
              myActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl bg-[#faf8f5] border border-[#e8e2d5] hover:border-[#d4c8b0] transition-colors flex items-start gap-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1c3541] text-[#e5b869] flex items-center justify-center shrink-0 mt-0.5">
                    {act.type === 'attendance' && <Clock className="w-4 h-4" />}
                    {act.type === 'leave' && <Calendar className="w-4 h-4" />}
                    {act.type === 'payroll' && <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#1c3541] truncate">{act.title}</h4>
                      <span className="text-[10px] font-medium text-slate-400 shrink-0">{act.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{act.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Personal Status Overview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e8e2d5] shadow-2xs">
            <h3 className="font-serif-title text-lg font-bold text-[#1c3541] mb-4">
              Employee Quick Overview
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] border border-[#e8e2d5]">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Work Status</span>
                </div>
                <span className="font-bold text-emerald-700">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] border border-[#e8e2d5]">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4 text-[#1c3541]" />
                  <span>Department</span>
                </div>
                <span className="font-bold text-[#1c3541]">{currentUser?.department || 'Engineering'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] border border-[#e8e2d5]">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-[#b5832a]" />
                  <span>Pending Leaves</span>
                </div>
                <span className="font-bold text-[#b5832a]">{pendingLeavesCount} Requests</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#f3efe6]">
              <button
                type="button"
                onClick={onApplyLeaveClick}
                className="w-full py-2.5 rounded-xl bg-[#1c3541] hover:bg-[#28495a] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#e5b869]" />
                <span>Apply For Leave Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
