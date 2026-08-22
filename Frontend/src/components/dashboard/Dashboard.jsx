import React, { useState } from 'react';
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

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isEmployee = currentUser?.role === 'Employee';

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
          {activeTab === 'employees' && <EmployeesView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'leave' && <LeaveView />}
          {activeTab === 'payroll' && <PayrollView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'ai' && <AiAssistantPanel />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
