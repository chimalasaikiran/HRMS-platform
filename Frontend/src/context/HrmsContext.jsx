import React, { createContext, useContext, useState, useEffect } from 'react';

const HrmsContext = createContext();

const INITIAL_EMPLOYEES = [
  {
    employeeId: 'HR-2025-01',
    fullName: 'Maya Chen',
    email: 'maya.chen@dayflow.work',
    role: 'HR / People team',
    department: 'People Operations',
    jobTitle: 'HR Director',
    phone: '+1 (555) 876-5432',
    address: '100 Park Avenue, New York, NY',
    joinedDate: 'Jan 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    basicSalary: 110000,
    hra: 35000,
    allowances: 15000,
    deductions: 12000,
    documents: [
      { name: 'Government_ID.pdf', date: 'Jan 15, 2024', size: '1.2 MB' },
      { name: 'Employment_Contract.pdf', date: 'Jan 15, 2024', size: '2.4 MB' },
      { name: 'July_2025_Payslip.pdf', date: 'Aug 01, 2025', size: '340 KB' }
    ]
  },
  {
    employeeId: 'EMP-2025-88',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@dayflow.work',
    role: 'Employee',
    department: 'Engineering',
    jobTitle: 'Senior Frontend Engineer',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Springfield',
    joinedDate: 'Mar 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    basicSalary: 85000,
    hra: 25000,
    allowances: 10000,
    deductions: 8000,
    documents: [
      { name: 'Passport_Scan.pdf', date: 'Mar 01, 2024', size: '1.8 MB' },
      { name: 'Offer_Letter.pdf', date: 'Mar 01, 2024', size: '1.1 MB' },
      { name: 'July_2025_Payslip.pdf', date: 'Aug 01, 2025', size: '310 KB' }
    ]
  },
  {
    employeeId: 'EMP-2025-42',
    fullName: 'Priya Sharma',
    email: 'priya.sharma@dayflow.work',
    role: 'Employee',
    department: 'Design',
    jobTitle: 'Lead UI/UX Designer',
    phone: '+1 (555) 345-6789',
    address: '12 Market St, San Francisco, CA',
    joinedDate: 'Feb 2024',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    basicSalary: 90000,
    hra: 28000,
    allowances: 12000,
    deductions: 9000,
    documents: [
      { name: 'ID_Card_Copy.pdf', date: 'Feb 10, 2024', size: '950 KB' },
      { name: 'Tax_Declaration_Form.pdf', date: 'Apr 05, 2024', size: '820 KB' }
    ]
  },
  {
    employeeId: 'EMP-2025-19',
    fullName: 'David Kim',
    email: 'david.kim@dayflow.work',
    role: 'Employee',
    department: 'Product',
    jobTitle: 'Senior Product Manager',
    phone: '+1 (555) 456-7890',
    address: '458 Pine St, Seattle, WA',
    joinedDate: 'Nov 2023',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    basicSalary: 105000,
    hra: 32000,
    allowances: 14000,
    deductions: 11000,
    documents: [
      { name: 'Employee_Agreement.pdf', date: 'Nov 01, 2023', size: '2.1 MB' }
    ]
  }
];

const TODAY_DATE = new Date().toISOString().split('T')[0];

const INITIAL_ATTENDANCE = [
  {
    id: 'att-1',
    employeeId: 'EMP-2025-88',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: TODAY_DATE,
    checkIn: '09:02 AM',
    checkOut: null,
    workHours: 'In progress',
    status: 'Present'
  },
  {
    id: 'att-2',
    employeeId: 'HR-2025-01',
    employeeName: 'Maya Chen',
    department: 'People Operations',
    date: TODAY_DATE,
    checkIn: '08:55 AM',
    checkOut: null,
    workHours: 'In progress',
    status: 'Present'
  },
  {
    id: 'att-3',
    employeeId: 'EMP-2025-42',
    employeeName: 'Priya Sharma',
    department: 'Design',
    date: TODAY_DATE,
    checkIn: '09:30 AM',
    checkOut: null,
    workHours: 'In progress',
    status: 'Present'
  },
  {
    id: 'att-4',
    employeeId: 'EMP-2025-19',
    employeeName: 'David Kim',
    department: 'Product',
    date: TODAY_DATE,
    checkIn: null,
    checkOut: null,
    workHours: '0h 0m',
    status: 'Leave'
  },
  {
    id: 'att-5',
    employeeId: 'EMP-2025-88',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2025-08-21',
    checkIn: '09:00 AM',
    checkOut: '05:30 PM',
    workHours: '8h 30m',
    status: 'Present'
  },
  {
    id: 'att-6',
    employeeId: 'EMP-2025-88',
    employeeName: 'Alex Morgan',
    department: 'Engineering',
    date: '2025-08-20',
    checkIn: null,
    checkOut: null,
    workHours: '0h 0m',
    status: 'Leave'
  }
];

const INITIAL_LEAVES = [
  {
    id: 'L-101',
    employeeId: 'EMP-2025-19',
    employeeName: 'David Kim',
    type: 'Paid',
    startDate: '2025-08-22',
    endDate: '2025-08-24',
    duration: '3 Days',
    reason: 'Attending product conference & family trip.',
    status: 'Pending',
    adminComment: '',
    appliedOn: 'Aug 21, 2025'
  },
  {
    id: 'L-102',
    employeeId: 'EMP-2025-88',
    employeeName: 'Alex Morgan',
    type: 'Sick',
    startDate: '2025-08-20',
    endDate: '2025-08-20',
    duration: '1 Day',
    reason: 'High fever and medical doctor consultation.',
    status: 'Approved',
    adminComment: 'Get well soon Alex! Rest up.',
    appliedOn: 'Aug 19, 2025'
  },
  {
    id: 'L-103',
    employeeId: 'EMP-2025-42',
    employeeName: 'Priya Sharma',
    type: 'Unpaid',
    startDate: '2025-09-01',
    endDate: '2025-09-02',
    duration: '2 Days',
    reason: 'Personal relocation work.',
    status: 'Pending',
    adminComment: '',
    appliedOn: 'Aug 22, 2025'
  }
];

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    title: 'Clock-in Recorded',
    desc: 'You checked in today at 09:02 AM on time.',
    time: '2 hours ago',
    type: 'attendance',
    forUser: 'EMP-2025-88'
  },
  {
    id: 2,
    title: 'Leave Request Approved',
    desc: 'HR approved your Sick Leave request for Aug 20, 2025.',
    time: 'Yesterday',
    type: 'leave',
    forUser: 'EMP-2025-88'
  },
  {
    id: 3,
    title: 'Payslip Released',
    desc: 'July 2025 payslip has been posted and available for view.',
    time: '3 days ago',
    type: 'payroll',
    forUser: 'all'
  },
  {
    id: 4,
    title: 'New Leave Request',
    desc: 'David Kim submitted a 3-day Paid Leave request.',
    time: '1 day ago',
    type: 'leave',
    forUser: 'admin'
  }
];

export const HrmsProvider = ({ children }) => {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('hrms_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const saved = localStorage.getItem('hrms_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('hrms_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('hrms_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  useEffect(() => {
    localStorage.setItem('hrms_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hrms_attendance', JSON.stringify(attendanceLogs));
  }, [attendanceLogs]);

  useEffect(() => {
    localStorage.setItem('hrms_leaves', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem('hrms_activities', JSON.stringify(activities));
  }, [activities]);

  // Check-In function
  const checkIn = (user) => {
    if (!user) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceLogs((prev) => {
      const existingToday = prev.find(
        (a) => a.employeeId === user.employeeId && a.date === TODAY_DATE
      );

      if (existingToday) {
        return prev.map((a) =>
          a.id === existingToday.id
            ? { ...a, checkIn: timeString, status: 'Present', workHours: 'In progress' }
            : a
        );
      }

      const newLog = {
        id: 'att-' + Date.now(),
        employeeId: user.employeeId,
        employeeName: user.fullName || user.email,
        department: user.department || 'General',
        date: TODAY_DATE,
        checkIn: timeString,
        checkOut: null,
        workHours: 'In progress',
        status: 'Present'
      };

      return [newLog, ...prev];
    });

    // Add activity alert
    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'Clock-in Recorded',
        desc: `You checked in at ${timeString}. Have a great workday!`,
        time: 'Just now',
        type: 'attendance',
        forUser: user.employeeId
      },
      ...prev
    ]);
  };

  // Check-Out function
  const checkOut = (user) => {
    if (!user) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceLogs((prev) =>
      prev.map((a) => {
        if (a.employeeId === user.employeeId && a.date === TODAY_DATE) {
          return {
            ...a,
            checkOut: timeString,
            workHours: '8h 00m' // Simulated completed work shift
          };
        }
        return a;
      })
    );

    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'Clock-out Recorded',
        desc: `You checked out at ${timeString}. Total work hours recorded.`,
        time: 'Just now',
        type: 'attendance',
        forUser: user.employeeId
      },
      ...prev
    ]);
  };

  // Apply Leave function
  const applyLeave = ({ employeeId, employeeName, type, startDate, endDate, duration, reason }) => {
    const newId = 'L-' + Math.floor(100 + Math.random() * 900);
    const newRequest = {
      id: newId,
      employeeId,
      employeeName,
      type: type || 'Paid',
      startDate,
      endDate,
      duration: duration || '1 Day',
      reason,
      status: 'Pending',
      adminComment: '',
      appliedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);

    // Add notification alerts
    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'Leave Request Submitted',
        desc: `Your ${type} leave request (${startDate} to ${endDate}) is under HR review.`,
        time: 'Just now',
        type: 'leave',
        forUser: employeeId
      },
      {
        id: Date.now() + 1,
        title: 'New Pending Leave Request',
        desc: `${employeeName} requested ${type} leave (${duration}).`,
        time: 'Just now',
        type: 'leave',
        forUser: 'admin'
      },
      ...prev
    ]);
  };

  // Approve Leave function
  const approveLeave = (leaveId, adminComment = '') => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === leaveId) {
          const updated = { ...req, status: 'Approved', adminComment };

          // Notify employee
          setActivities((aPrev) => [
            {
              id: Date.now(),
              title: 'Leave Request Approved',
              desc: `Your ${req.type} leave request has been APPROVED by HR.${adminComment ? ` Note: "${adminComment}"` : ''}`,
              time: 'Just now',
              type: 'leave',
              forUser: req.employeeId
            },
            ...aPrev
          ]);

          return updated;
        }
        return req;
      })
    );
  };

  // Reject Leave function
  const rejectLeave = (leaveId, adminComment = '') => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === leaveId) {
          const updated = { ...req, status: 'Rejected', adminComment };

          // Notify employee
          setActivities((aPrev) => [
            {
              id: Date.now(),
              title: 'Leave Request Update',
              desc: `Your ${req.type} leave request was REJECTED by HR.${adminComment ? ` Reason: "${adminComment}"` : ''}`,
              time: 'Just now',
              type: 'leave',
              forUser: req.employeeId
            },
            ...aPrev
          ]);

          return updated;
        }
        return req;
      })
    );
  };

  // Update Employee Profile
  const updateEmployeeProfile = (employeeId, updatedData, isSelfEdit = false) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.employeeId === employeeId) {
          if (isSelfEdit) {
            // Limited edit for employees: address, phone, avatar
            return {
              ...emp,
              phone: updatedData.phone !== undefined ? updatedData.phone : emp.phone,
              address: updatedData.address !== undefined ? updatedData.address : emp.address,
              avatar: updatedData.avatar !== undefined ? updatedData.avatar : emp.avatar
            };
          } else {
            // Full edit for Admin
            return {
              ...emp,
              ...updatedData
            };
          }
        }
        return emp;
      })
    );
  };

  // Update Salary Structure (Admin action)
  const updateSalaryStructure = (employeeId, salaryData) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.employeeId === employeeId) {
          return {
            ...emp,
            basicSalary: Number(salaryData.basicSalary) || emp.basicSalary,
            hra: Number(salaryData.hra) || emp.hra,
            allowances: Number(salaryData.allowances) || emp.allowances,
            deductions: Number(salaryData.deductions) || emp.deductions
          };
        }
        return emp;
      })
    );

    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'Salary Structure Updated',
        desc: `Salary structure updated for employee ID: ${employeeId}.`,
        time: 'Just now',
        type: 'payroll',
        forUser: 'admin'
      },
      ...prev
    ]);
  };

  // Update Attendance Status manually (Admin action)
  const updateAttendanceStatus = (recordId, newStatus) => {
    setAttendanceLogs((prev) =>
      prev.map((log) => (log.id === recordId ? { ...log, status: newStatus } : log))
    );
  };

  return (
    <HrmsContext.Provider
      value={{
        employees,
        attendanceLogs,
        leaveRequests,
        activities,
        todayDate: TODAY_DATE,
        checkIn,
        checkOut,
        applyLeave,
        approveLeave,
        rejectLeave,
        updateEmployeeProfile,
        updateSalaryStructure,
        updateAttendanceStatus
      }}
    >
      {children}
    </HrmsContext.Provider>
  );
};

export const useHrms = () => {
  const context = useContext(HrmsContext);
  if (!context) {
    throw new Error('useHrms must be used within a HrmsProvider');
  }
  return context;
};
