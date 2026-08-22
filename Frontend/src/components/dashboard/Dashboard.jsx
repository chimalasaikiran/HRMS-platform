import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { EmployeeDashboard } from './EmployeeDashboard';
import { WelcomeBanner } from './WelcomeBanner';
import { LivePulseCard } from './LivePulseCard';
import { MetricCards } from './MetricCards';
import { PendingLeaveCard } from './PendingLeaveCard';
import { TodayPresenceCard } from './TodayPresenceCard';
import { AttendanceStreamTable } from './AttendanceStreamTable';

import { EmployeesView } from './views/EmployeesView';
import { AttendanceView } from './views/AttendanceView';
import { LeaveView } from './views/LeaveView';
import { PayrollView } from './views/PayrollView';
import { ProfileView } from './views/ProfileView';
import { AiAssistantPanel } from '../ai/AiAssistantPanel';


/** Shown when someone reaches a view their role cannot use. */
const RestrictedView = () => (
  <div className="bg-white rounded-2xl border border-[#e8e2d5] shadow-xs p-10 text-center">
    <div className="w-12 h-12 rounded-2xl bg-[#faf8f5] border border-[#e8e2d5] flex items-center justify-center mx-auto mb-4">
      <Lock className="w-5 h-5 text-slate-400" />
    </div>
    <h3 className="font-serif-title text-lg font-bold text-[#1c3541]">
      Restricted
    </h3>
    <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
      This section is available to HR officers only. Your own records are on the
      Attendance, Leave and Payroll tabs.
    </p>
  </div>
);

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isEmployee = currentUser?.role === 'EMPLOYEE';

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 font-sans flex">
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} onNavigate={setActiveTab} />

        {/* Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {isEmployee ? (
                /* EMPLOYEE DASHBOARD */
                <EmployeeDashboard
                  onNavigate={setActiveTab}
                  onApplyLeaveClick={() => setActiveTab('leave')}
                />
              ) : (
                /* ADMIN / HR DASHBOARD */
                <div className="animate-fade-in space-y-8">
                  <WelcomeBanner />
                  <LivePulseCard onViewAttendance={() => setActiveTab('attendance')} />
                  <MetricCards />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <PendingLeaveCard onReviewAll={() => setActiveTab('leave')} />
                    <TodayPresenceCard onDirectoryClick={() => setActiveTab('employees')} />
                  </div>
                  <AttendanceStreamTable />
                </div>
              )}
            </>
          )}

          {/* SHARED / SCOPED VIEWS */}
          {/* Admin-only. The sidebar hides this tab for employees, but hiding a
              nav item is not access control — guard the render too. The API
              refuses the data regardless; this stops a broken half-page. */}
          {activeTab === 'employees' &&
            (isEmployee ? <RestrictedView /> : <EmployeesView />)}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'leave' && <LeaveView />}
          {activeTab === 'payroll' && <PayrollView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'assistant' && <AiAssistantPanel />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
