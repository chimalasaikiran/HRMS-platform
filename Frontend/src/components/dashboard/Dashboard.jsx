import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  User,
  ShieldCheck,
  Building,
  Clock,
  Calendar,
  Users,
  CheckCircle,
  TrendingUp,
  FileText,
  Briefcase,
  Bell,
  Sparkles
} from 'lucide-react';

export const Dashboard = ({ onLogout }) => {
  const { currentUser, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    if (onLogout) onLogout();
  };

  const isHR = currentUser?.role === 'HR / People team';

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#1c3541] text-white border-b border-[#2d4957] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#c89e60] text-[#1c3541] font-serif font-bold text-lg flex items-center justify-center">
              d
            </div>
            <span className="font-serif-title font-bold text-xl tracking-wide text-white">
              dayflow
            </span>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-white/10 text-amber-200 border border-white/10 ml-2">
              HRMS Workspace
            </span>
          </div>

          {/* Right Navigation & Profile */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c89e60]" />
            </button>

            <div className="h-6 w-px bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-3">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser?.fullName || 'User avatar'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#c89e60]/50"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {currentUser?.fullName || 'Teammate'}
                </div>
                <div className="text-[10px] text-amber-200/80 font-medium">
                  {currentUser?.employeeId || 'EMP-1001'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-red-600/80 text-white transition-all cursor-pointer ml-2 border border-white/10"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#1c3541] via-[#244252] to-[#162933] text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c89e60]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#c89e60] mb-2">
                <Sparkles className="w-4 h-4" />
                <span>HRMS PORTAL • ACTIVE SESSION</span>
              </div>
              <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-white mb-2">
                Welcome back, {currentUser?.fullName || 'User'}!
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                You are logged into the <span className="text-amber-200 font-semibold">{currentUser?.role}</span> dashboard. Everything is running smoothly for your organization today.
              </p>
            </div>

            {/* User Details Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 flex flex-col gap-2 min-w-[240px]">
              <div className="flex items-center gap-2 text-xs text-amber-100">
                {isHR ? <ShieldCheck className="w-4 h-4 text-[#c89e60]" /> : <User className="w-4 h-4 text-[#c89e60]" />}
                <span className="font-semibold text-white">{currentUser?.role}</span>
              </div>
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Employee ID:</span>{' '}
                <span className="font-mono text-white bg-black/20 px-2 py-0.5 rounded text-[11px]">{currentUser?.employeeId}</span>
              </div>
              <div className="text-xs text-slate-300 truncate">
                <span className="font-semibold text-slate-400">Email:</span>{' '}
                <span className="text-white">{currentUser?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#e8e4db] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Team</span>
              <div className="p-2 rounded-xl bg-amber-50 text-[#c89e60]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1c3541]">148 Members</div>
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +4 joined this week
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8e4db] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Attendance</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1c3541]">98.4%</div>
            <div className="text-xs text-slate-500 mt-1">145 / 148 checked in</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8e4db] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Requests</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1c3541]">3 Pending</div>
            <div className="text-xs text-amber-700 font-medium mt-1">Requires HR approval</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8e4db] shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workplace Pulse</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1c3541]">9.4 / 10</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">Excellent engagement</div>
          </div>
        </div>

        {/* Quick Operations & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Actions & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8e4db] shadow-xs">
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541] mb-4">
                People Operations Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  className="p-4 rounded-xl border border-[#e8e4db] hover:border-[#1c3541] hover:bg-[#f9f8f4] transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
                >
                  <Clock className="w-6 h-6 text-[#1c3541] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-700">Clock In / Out</span>
                </button>

                <button
                  type="button"
                  className="p-4 rounded-xl border border-[#e8e4db] hover:border-[#1c3541] hover:bg-[#f9f8f4] transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
                >
                  <Calendar className="w-6 h-6 text-[#1c3541] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-700">Apply Leave</span>
                </button>

                <button
                  type="button"
                  className="p-4 rounded-xl border border-[#e8e4db] hover:border-[#1c3541] hover:bg-[#f9f8f4] transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
                >
                  <FileText className="w-6 h-6 text-[#1c3541] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-700">Payroll & Slips</span>
                </button>

                <button
                  type="button"
                  className="p-4 rounded-xl border border-[#e8e4db] hover:border-[#1c3541] hover:bg-[#f9f8f4] transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
                >
                  <Users className="w-6 h-6 text-[#1c3541] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-700">Employee Directory</span>
                </button>

                <button
                  type="button"
                  className="p-4 rounded-xl border border-[#e8e4db] hover:border-[#1c3541] hover:bg-[#f9f8f4] transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
                >
                  <Briefcase className="w-6 h-6 text-[#1c3541] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-700">Company Policies</span>
                </button>

                <button
                  type="button"
                  className="p-4 rounded-xl border border-[#e8e4db] hover:border-[#1c3541] hover:bg-[#f9f8f4] transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
                >
                  <Building className="w-6 h-6 text-[#1c3541] group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-700">Department Overview</span>
                </button>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white p-6 rounded-2xl border border-[#e8e4db] shadow-xs">
              <h3 className="font-serif-title text-xl font-bold text-[#1c3541] mb-4">
                Registered Profile Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#ece8df]">
                  <span className="text-xs text-slate-400 font-medium block mb-0.5">Full Name</span>
                  <span className="font-semibold text-slate-800">{currentUser?.fullName}</span>
                </div>
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#ece8df]">
                  <span className="text-xs text-slate-400 font-medium block mb-0.5">Employee ID</span>
                  <span className="font-mono font-semibold text-[#1c3541]">{currentUser?.employeeId}</span>
                </div>
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#ece8df]">
                  <span className="text-xs text-slate-400 font-medium block mb-0.5">Work Email</span>
                  <span className="font-semibold text-slate-800">{currentUser?.email}</span>
                </div>
                <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#ece8df]">
                  <span className="text-xs text-slate-400 font-medium block mb-0.5">System Role</span>
                  <span className="font-semibold text-[#c89e60]">{currentUser?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Activity Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-[#e8e4db] shadow-xs flex flex-col">
            <h3 className="font-serif-title text-xl font-bold text-[#1c3541] mb-4">
              Recent Workspace Updates
            </h3>
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#faf8f5] transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Successful Authentication
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Logged in via email ({currentUser?.email})
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Just now</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#faf8f5] transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs font-bold">
                  ★
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Q3 Operations Review
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    All department managers completed performance feedback.
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">2 hours ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#faf8f5] transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 text-xs font-bold">
                  i
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Holiday Policy Updated
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Updated annual leave calendar for 2025-2026.
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Yesterday</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dashboard Footer */}
      <footer className="border-t border-[#e8e4db] bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          Dayflow Human Resources Operations Platform • Version 2.4
        </div>
      </footer>
    </div>
  );
};
