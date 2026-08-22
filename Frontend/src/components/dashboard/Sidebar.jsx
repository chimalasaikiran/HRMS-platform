import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  CreditCard,
  User,
  LogOut,
  ChevronDown,
  X,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHrms } from '../../context/HrmsContext';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const { leaveRequests } = useHrms();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    currentUser?.role === 'Employee' ? 'Employee Portal' : 'People team'
  );

  const isEmployee = currentUser?.role === 'EMPLOYEE';

  const pendingCount = leaveRequests.filter(
    (l) => isEmployee ? (l.employeeId === currentUser?.id || l.loginId === currentUser?.loginId) && l.status === 'PENDING' : l.status === 'PENDING'
  ).length;

  const handleSignOut = () => {
    logout();
  };

  const navItems = [
    { id: 'overview', label: isEmployee ? 'Employee Dashboard' : 'Overview', icon: LayoutDashboard, category: 'WORKSPACE' },
    { id: 'employees', label: 'Employees', icon: Users, category: 'WORKSPACE', adminOnly: true },
    { id: 'attendance', label: isEmployee ? 'My Attendance' : 'Attendance', icon: Clock, category: 'WORKSPACE' },
    {
      id: 'leave',
      label: isEmployee ? 'Leave Requests' : 'Leave',
      icon: Calendar,
      category: 'WORKSPACE',
      badge: pendingCount > 0 ? String(pendingCount) : null
    },
    { id: 'payroll', label: isEmployee ? 'My Payroll' : 'Payroll', icon: CreditCard, category: 'WORKSPACE' },
    { id: 'assistant', label: 'Dayflow AI Assistant', icon: Shield, category: 'PERSONAL' },
    { id: 'profile', label: 'My Profile', icon: User, category: 'PERSONAL' }
  ];

  const visibleItems = navItems.filter((item) => !item.adminOnly || !isEmployee);
  const workspaceNav = visibleItems.filter((item) => item.category === 'WORKSPACE');
  const personalNav = visibleItems.filter((item) => item.category === 'PERSONAL');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#1c3541] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5 custom-scrollbar">
          {/* Top Brand Logo Header */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#e5b869] text-[#1c3541] font-serif font-bold text-xl flex items-center justify-center shadow-xs">
                d
              </div>
              <span className="font-serif-title font-bold text-2xl tracking-tight text-white">
                dayflow
              </span>
            </div>
            {/* Close button for mobile */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Card */}
          <div className="relative mb-6">
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full bg-[#162b35] hover:bg-[#203a48] border border-white/10 rounded-xl p-3 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#e5b869] text-[#1c3541] font-bold text-xs flex items-center justify-center shrink-0">
                  {isEmployee ? 'E' : 'HR'}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#e5b869]" />
                    <span>{currentUser?.role || 'User'}</span>
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {selectedWorkspace}
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {workspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#162b35] border border-white/15 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                {['People team', 'Engineering HR', 'Executive Org', 'Employee Workspace'].map((ws) => (
                  <button
                    key={ws}
                    type="button"
                    onClick={() => {
                      setSelectedWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedWorkspace === ws ? 'bg-[#e5b869]/20 text-[#e5b869] font-bold' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{ws}</span>
                    {selectedWorkspace === ws && <span className="w-1.5 h-1.5 rounded-full bg-[#e5b869]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Section: WORKSPACE */}
          <div className="space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                Workspace
              </div>
              <nav className="space-y-1">
                {workspaceNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#e5b869] text-[#1c3541] font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1c3541]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive ? 'bg-[#1c3541] text-[#e5b869]' : 'bg-[#e76f51] text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Navigation Section: PERSONAL */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                Personal
              </div>
              <nav className="space-y-1">
                {personalNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#e5b869] text-[#1c3541] font-bold shadow-xs'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#1c3541]' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-[#162b35] space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Everything in order.</span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
