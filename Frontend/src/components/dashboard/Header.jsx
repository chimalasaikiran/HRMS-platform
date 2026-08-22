import React, { useState } from 'react';
import { Menu, Bell, ChevronDown, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHrms } from '../../context/HrmsContext';

export const Header = ({ onOpenSidebar, onNavigate }) => {
  const { currentUser, logout } = useAuth();
  const { activities, checkInState, checkIn, checkOut } = useHrms();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const empId = currentUser?.employeeId || 'HR-2025-01';
  const myActivities = activities.filter(
    (a) => a.forUser === empId || a.forUser === 'all' || (currentUser?.role !== 'Employee' && a.forUser === 'admin')
  ).slice(0, 4);

  const getInitials = (name) => {
    if (!name) return 'MC';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-[#e8e2d5] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* Left side: Hamburger Toggle (Mobile/Tablet) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-[#faf6f0] transition-colors cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Welcome to Dayflow</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs font-semibold text-[#1c3541]">
            {currentUser?.role === 'EMPLOYEE' ? 'Employee Portal' : 'Admin & HR Management'}
          </span>
        </div>
      </div>

      {/* Right side: Systray, Notifications & User Profile Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Check In / Check Out Systray Button */}
        <div className="flex items-center gap-2 bg-[#faf6f0] border border-[#e8e2d5] rounded-full px-3 py-1 text-xs">
          {checkInState?.isCheckedIn ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-soft" />
              <span className="text-slate-600 hidden sm:inline text-[11px] font-medium">
                Since {checkInState.checkInTime || '09:30 AM'}
              </span>
              <button
                type="button"
                onClick={() => checkOut(currentUser)}
                className="font-semibold text-red-600 hover:text-red-700 cursor-pointer ml-1 text-xs transition-colors"
              >
                Check Out &rarr;
              </button>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <button
                type="button"
                onClick={() => checkIn(currentUser)}
                className="font-semibold text-[#1c3541] hover:text-[#28495a] cursor-pointer text-xs transition-colors"
              >
                Check IN &rarr;
              </button>
            </>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileDropdownOpen(false);
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-[#faf6f0] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {myActivities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e5b869] ring-2 ring-white" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e8e2d5] rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-fade-in">
              <div className="px-4 py-2 border-b border-[#f3efe6] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1c3541] uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] font-semibold bg-[#e5b869]/20 text-[#b5832a] px-2 py-0.5 rounded-full">
                  {myActivities.length} New
                </span>
              </div>
              <div className="divide-y divide-[#f5f2eb] max-h-72 overflow-y-auto custom-scrollbar">
                {myActivities.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  myActivities.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-[#faf8f5] transition-colors cursor-pointer">
                      <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{n.desc}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#e8e2d5]" />


        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-[#faf6f0] transition-all cursor-pointer border border-transparent hover:border-[#e8e2d5]"
          >
            <div className="w-8 h-8 rounded-full bg-[#ebdcb9] text-[#705220] font-semibold text-xs flex items-center justify-center ring-2 ring-[#e5b869]/40 shrink-0">
              {getInitials(currentUser?.fullName || 'Maya Chen')}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-[#1c3541] tracking-tight leading-tight">
                {currentUser?.fullName || 'Maya Chen'}
              </span>
              <span className="block text-[10px] text-slate-400 font-medium leading-none">
                {currentUser?.role || 'Employee'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-[#e8e2d5] rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-fade-in">
              <div className="px-4 py-3 border-b border-[#f3efe6] bg-[#faf8f5]">
                <div className="text-xs font-semibold text-[#1c3541]">
                  {currentUser?.fullName || 'Maya Chen'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {currentUser?.email || 'maya.chen@dayflow.work'}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#b5832a]">
                  <Shield className="w-3 h-3" />
                  <span>{currentUser?.role || 'HR / People team'}</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onNavigate) onNavigate('profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-[#faf6f0] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>View Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onNavigate) onNavigate('profile');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-[#faf6f0] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </button>
              </div>

              <div className="border-t border-[#f3efe6] pt-1">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
