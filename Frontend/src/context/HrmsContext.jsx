import React, { createContext, useContext, useState, useEffect } from 'react';
import { employeesApi, attendanceApi, timeoffApi } from '../services/api';

const HrmsContext = createContext();

export function computeSalary(wageNum) {
  const wage = Number(wageNum) || 0;
  const basic = Math.round(wage * 0.50 * 100) / 100;
  const hra = Math.round(basic * 0.50 * 100) / 100;
  const std = 4167;
  const bonus = Math.round(basic * 0.0833 * 100) / 100;
  const lta = Math.round(basic * 0.0833 * 100) / 100;
  const fixed = Math.round((wage - (basic + hra + std + bonus + lta)) * 100) / 100;

  const pfEmployee = Math.round(basic * 0.12 * 100) / 100;
  const pfEmployer = Math.round(basic * 0.12 * 100) / 100;
  const ptax = 200;

  const gross = wage;
  const netPay = Math.round((gross - pfEmployee - ptax) * 100) / 100;

  return {
    wage,
    workingDaysPerWeek: 5,
    breakMinutes: 60,
    hoursPerDay: 8,
    earnings: [
      { key: 'BASIC', label: 'Basic Salary', amount: basic, percent: 50.00 },
      { key: 'HRA', label: 'House Rent Allowance', amount: hra, percent: 50.00 },
      { key: 'STD', label: 'Standard Allowance', amount: std, percent: basic ? Math.round((std / basic) * 10000) / 100 : 16.67 },
      { key: 'BONUS', label: 'Performance Bonus', amount: bonus, percent: 8.33 },
      { key: 'LTA', label: 'Leave Travel Allowance', amount: lta, percent: 8.33 },
      { key: 'FIXED', label: 'Fixed Allowance', amount: fixed, percent: basic ? Math.round((fixed / basic) * 10000) / 100 : 16.67 }
    ],
    deductions: [
      { key: 'PF_EMPLOYEE', label: 'PF — employee', amount: pfEmployee, percent: 12.00 },
      { key: 'PF_EMPLOYER', label: 'PF — employer', amount: pfEmployer, percent: 12.00 },
      { key: 'PTAX', label: 'Professional Tax', amount: ptax }
    ],
    gross,
    netPay
  };
}

const INITIAL_EMPLOYEES = [
  {
    id: 'emp-1',
    loginId: 'OIHAAD20220001',
    name: 'Hari Admin',
    fullName: 'Hari Admin',
    email: 'hr@dayflow.com',
    role: 'ADMIN',
    department: 'Human Resources',
    jobPosition: 'HR Officer',
    mobile: '+91 9876500001',
    company: 'Odoo India',
    location: 'Gandhinagar',
    status: 'PRESENT',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    resume: {
      about: 'Managing HR Operations and AI Integration',
      loveAboutJob: 'Helping people grow',
      interests: 'Reading, Chess',
      skills: ['HR Strategy', 'Leadership'],
      certifications: ['SHRM Certified']
    },
    privateInfo: {
      dateOfBirth: '1990-05-15',
      nationality: 'Indian',
      personalEmail: 'hari.personal@gmail.com',
      maritalStatus: 'Married',
      gender: 'Male',
      residingAddress: '100 Park Ave, Gandhinagar',
      dateOfJoining: '2022-01-15',
      bank: { accountNumber: '9876543210', bankName: 'HDFC Bank', ifsc: 'HDFC0001234', pan: 'ABCDE1234F', uan: '100000000000', empCode: 'OIHAAD20220001' }
    },
    salary: { wage: 80000, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 }
  },
  {
    id: 'emp-2',
    loginId: 'OIJODO20220001',
    name: 'John Doe',
    fullName: 'John Doe',
    email: 'john.doe@dayflow.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    jobPosition: 'Backend Developer',
    mobile: '+91 9876500002',
    company: 'Odoo India',
    location: 'Gandhinagar',
    status: 'PRESENT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    resume: {
      about: 'Backend systems architecture and API design',
      loveAboutJob: 'Solving complex algorithms',
      interests: 'Open source, gaming',
      skills: ['Node.js', 'Express', 'MongoDB'],
      certifications: ['AWS Developer']
    },
    privateInfo: {
      dateOfBirth: '1995-08-20',
      nationality: 'Indian',
      personalEmail: 'john.doe.personal@gmail.com',
      maritalStatus: 'Single',
      gender: 'Male',
      residingAddress: '742 Evergreen Terr, Gandhinagar',
      dateOfJoining: '2022-03-01',
      bank: { accountNumber: '1234567890', bankName: 'ICICI Bank', ifsc: 'ICIC0005678', pan: 'FGHIJ5678K', uan: '100000000001', empCode: 'OIJODO20220001' }
    },
    salary: { wage: 50000, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 }
  },
  {
    id: 'emp-3',
    loginId: 'OIPRSH20220002',
    name: 'Priya Shah',
    fullName: 'Priya Shah',
    email: 'priya.shah@dayflow.com',
    role: 'EMPLOYEE',
    department: 'Engineering',
    jobPosition: 'Frontend Developer',
    mobile: '+91 9876500003',
    company: 'Odoo India',
    location: 'Gandhinagar',
    status: 'ON_LEAVE',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    resume: {
      about: 'UI engineer passionate about accessible interfaces',
      loveAboutJob: 'Crafting responsive designs',
      interests: 'Digital painting, travel',
      skills: ['React', 'Tailwind CSS', 'TypeScript'],
      certifications: ['Meta Frontend Professional']
    },
    privateInfo: {
      dateOfBirth: '1997-11-12',
      nationality: 'Indian',
      personalEmail: 'priya.shah.personal@gmail.com',
      maritalStatus: 'Single',
      gender: 'Female',
      residingAddress: '12 Market St, Gandhinagar',
      dateOfJoining: '2022-04-10',
      bank: { accountNumber: '5554443332', bankName: 'Axis Bank', ifsc: 'UTIB0009999', pan: 'LMNOP9999Q', uan: '100000000002', empCode: 'OIPRSH20220002' }
    },
    salary: { wage: 48000, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 }
  },
  {
    id: 'emp-4',
    loginId: 'OIAMPA20220003',
    name: 'Amit Patel',
    fullName: 'Amit Patel',
    email: 'amit.patel@dayflow.com',
    role: 'EMPLOYEE',
    department: 'Finance',
    jobPosition: 'Accounts Manager',
    mobile: '+91 9876500004',
    company: 'Odoo India',
    location: 'Gandhinagar',
    status: 'ABSENT',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    resume: {
      about: 'Financial compliance and payroll management',
      loveAboutJob: 'Numbers and tax strategy',
      interests: 'Investing, cycling',
      skills: ['Accounting', 'Financial Analysis'],
      certifications: ['CA Certified']
    },
    privateInfo: {
      dateOfBirth: '1988-02-14',
      nationality: 'Indian',
      personalEmail: 'amit.patel@gmail.com',
      maritalStatus: 'Married',
      gender: 'Male',
      residingAddress: '45 Pine St, Gandhinagar',
      dateOfJoining: '2022-02-20',
      bank: { accountNumber: '8887776665', bankName: 'SBI', ifsc: 'SBIN0001111', pan: 'RSTUV1111W', uan: '100000000003', empCode: 'OIAMPA20220003' }
    },
    salary: { wage: 55000, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 }
  }
];

const TODAY_DATE = new Date().toISOString().split('T')[0];

const INITIAL_ATTENDANCE = [
  {
    id: 'att-1',
    employeeId: 'emp-2',
    loginId: 'OIJODO20220001',
    employeeName: 'John Doe',
    date: TODAY_DATE,
    checkIn: '09:30',
    checkOut: null,
    workHours: 'In progress',
    status: 'PRESENT'
  },
  {
    id: 'att-2',
    employeeId: 'emp-1',
    loginId: 'OIHAAD20220001',
    employeeName: 'Hari Admin',
    date: TODAY_DATE,
    checkIn: '09:15',
    checkOut: null,
    workHours: 'In progress',
    status: 'PRESENT'
  }
];

const INITIAL_LEAVES = [
  {
    id: 'L-101',
    employeeId: 'emp-2',
    loginId: 'OIJODO20220001',
    employeeName: 'John Doe',
    type: 'SICK',
    startDate: TODAY_DATE,
    endDate: TODAY_DATE,
    days: 1,
    reason: 'Fever and medical consultation',
    attachmentUrl: 'https://example.com/certificate.pdf',
    status: 'PENDING',
    reviewComment: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'L-102',
    employeeId: 'emp-3',
    loginId: 'OIPRSH20220002',
    employeeName: 'Priya Shah',
    type: 'PAID',
    startDate: '2025-08-20',
    endDate: '2025-08-21',
    days: 2,
    reason: 'Family event',
    attachmentUrl: '',
    status: 'APPROVED',
    reviewComment: 'Approved by HR',
    createdAt: '2025-08-19T10:00:00Z'
  }
];

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    title: 'Check-In Recorded',
    desc: 'You checked in today at 09:30 AM.',
    time: '2 hours ago',
    type: 'attendance',
    forUser: 'OIJODO20220001'
  },
  {
    id: 2,
    title: 'Time-Off Approved',
    desc: 'HR approved Priya Shah paid time-off request.',
    time: 'Yesterday',
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

  const [checkInState, setCheckInState] = useState({
    isCheckedIn: true,
    checkInTime: '09:30 AM'
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

  // Sync with backend on load if backend is available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const empRes = await employeesApi.getAll();
        if (empRes.data && Array.isArray(empRes.data)) {
          setEmployees(empRes.data.map(e => ({
            ...e,
            fullName: e.name || e.fullName || `${e.firstName || ''} ${e.lastName || ''}`.trim(),
            avatar: e.avatarUrl || e.avatar
          })));
        }
      } catch (err) {
        // Fallback to local state
      }
    }
    loadBackendData();
  }, []);

  const checkIn = async (user) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      await attendanceApi.checkIn();
    } catch (err) {
      console.warn('[HrmsContext] Offline checkIn fallback');
    }

    setCheckInState({ isCheckedIn: true, checkInTime: timeString });

    setAttendanceLogs((prev) => [
      {
        id: 'att-' + Date.now(),
        employeeId: user?.id || 'emp-2',
        loginId: user?.loginId || 'OIJODO20220001',
        employeeName: user?.fullName || 'User',
        date: TODAY_DATE,
        checkIn: timeString,
        checkOut: null,
        workHours: 'In progress',
        status: 'PRESENT'
      },
      ...prev
    ]);

    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'Check-In Completed',
        desc: `Checked in at ${timeString}. Have a great day!`,
        time: 'Just now',
        type: 'attendance',
        forUser: user?.loginId || 'all'
      },
      ...prev
    ]);
  };

  const checkOut = async (user) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      await attendanceApi.checkOut();
    } catch (err) {
      console.warn('[HrmsContext] Offline checkOut fallback');
    }

    setCheckInState({ isCheckedIn: false, checkInTime: null });

    setAttendanceLogs((prev) =>
      prev.map((a) => (a.date === TODAY_DATE ? { ...a, checkOut: timeString, workHours: '8h 00m' } : a))
    );

    setActivities((prev) => [
      {
        id: Date.now(),
        title: 'Check-Out Completed',
        desc: `Checked out at ${timeString}. Work shift ended.`,
        time: 'Just now',
        type: 'attendance',
        forUser: user?.loginId || 'all'
      },
      ...prev
    ]);
  };

  const createEmployee = async (empForm) => {
    try {
      const res = await employeesApi.create(empForm);
      const created = res.data?.employee || res.data;
      const tempPassword = res.data?.tempPassword || 'Dayflow@123';

      const newEmpItem = {
        id: created.id || 'emp-' + Date.now(),
        loginId: created.loginId || 'OIJODO2026' + Math.floor(1000 + Math.random() * 9000),
        name: `${empForm.firstName} ${empForm.lastName}`,
        fullName: `${empForm.firstName} ${empForm.lastName}`,
        email: empForm.email,
        jobPosition: empForm.jobPosition,
        department: empForm.department,
        location: empForm.location || 'Gandhinagar',
        status: 'PRESENT',
        role: 'EMPLOYEE',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(empForm.firstName)}`,
        salary: { wage: 50000, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 },
        privateInfo: {
          residingAddress: empForm.location || 'Gandhinagar',
          dateOfJoining: empForm.dateOfJoining || TODAY_DATE,
          bank: { accountNumber: '', bankName: '', ifsc: '', pan: '', uan: '', empCode: created.loginId }
        },
        resume: { about: '', loveAboutJob: '', interests: '', skills: [], certifications: [] }
      };

      setEmployees((prev) => [newEmpItem, ...prev]);

      return {
        employee: newEmpItem,
        loginId: newEmpItem.loginId,
        tempPassword
      };
    } catch (err) {
      if (err.status) throw err;

      // Local fallback creation
      const genLoginId = 'OI' + empForm.firstName.slice(0, 2).toUpperCase() + empForm.lastName.slice(0, 2).toUpperCase() + '202600' + Math.floor(10 + Math.random() * 89);
      const newEmpItem = {
        id: 'emp-' + Date.now(),
        loginId: genLoginId,
        name: `${empForm.firstName} ${empForm.lastName}`,
        fullName: `${empForm.firstName} ${empForm.lastName}`,
        email: empForm.email,
        jobPosition: empForm.jobPosition,
        department: empForm.department,
        location: empForm.location || 'Gandhinagar',
        status: 'PRESENT',
        role: 'EMPLOYEE',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(empForm.firstName)}`,
        salary: { wage: 50000, workingDaysPerWeek: 5, breakMinutes: 60, hoursPerDay: 8 },
        privateInfo: {
          residingAddress: empForm.location || 'Gandhinagar',
          dateOfJoining: empForm.dateOfJoining || TODAY_DATE,
          bank: { accountNumber: '', bankName: '', ifsc: '', pan: '', uan: '', empCode: genLoginId }
        },
        resume: { about: '', loveAboutJob: '', interests: '', skills: [], certifications: [] }
      };

      setEmployees((prev) => [newEmpItem, ...prev]);
      return {
        employee: newEmpItem,
        loginId: genLoginId,
        tempPassword: 'Dayflow@123'
      };
    }
  };

  const updateEmployeeProfile = async (empId, updateData, isSelfEdit = false) => {
    try {
      await employeesApi.update(empId, updateData);
    } catch (err) {
      console.warn('[HrmsContext] Offline update fallthrough');
    }

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId || emp.loginId === empId) {
          return {
            ...emp,
            ...updateData,
            name: updateData.name || updateData.fullName || emp.name,
            fullName: updateData.fullName || updateData.name || emp.fullName
          };
        }
        return emp;
      })
    );
  };

  const updateSalaryStructure = async (empId, wageNum) => {
    const wage = Number(wageNum) || 0;
    try {
      await employeesApi.updateSalary(empId, { wage });
    } catch (err) {
      console.warn('[HrmsContext] Offline salary update fallthrough');
    }

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === empId || emp.loginId === empId) {
          return {
            ...emp,
            salary: { ...(emp.salary || {}), wage }
          };
        }
        return emp;
      })
    );
  };

  const applyLeave = async (reqData) => {
    const payload = {
      type: reqData.type || 'SICK',
      startDate: reqData.startDate,
      endDate: reqData.endDate,
      days: reqData.days || 1,
      reason: reqData.reason || '',
      attachmentUrl: reqData.attachmentUrl || ''
    };

    try {
      await timeoffApi.create(payload);
    } catch (err) {
      console.warn('[HrmsContext] Offline applyLeave fallthrough');
    }

    const newReq = {
      id: 'L-' + Math.floor(100 + Math.random() * 900),
      employeeId: reqData.employeeId || 'emp-2',
      loginId: reqData.loginId || 'OIJODO20220001',
      employeeName: reqData.employeeName || 'John Doe',
      type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
      days: payload.days,
      reason: payload.reason,
      attachmentUrl: payload.attachmentUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setLeaveRequests((prev) => [newReq, ...prev]);
  };

  const approveLeave = async (leaveId, comment = '') => {
    try {
      await timeoffApi.approve(leaveId, comment);
    } catch (err) {
      console.warn('[HrmsContext] Offline approveLeave fallthrough');
    }

    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'APPROVED', reviewComment: comment } : l))
    );
  };

  const rejectLeave = async (leaveId, comment = '') => {
    try {
      await timeoffApi.reject(leaveId, comment);
    } catch (err) {
      console.warn('[HrmsContext] Offline rejectLeave fallthrough');
    }

    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === leaveId ? { ...l, status: 'REJECTED', reviewComment: comment } : l))
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
        checkInState,
        checkIn,
        checkOut,
        createEmployee,
        updateEmployeeProfile,
        updateSalaryStructure,
        applyLeave,
        approveLeave,
        rejectLeave,
        computeSalary
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

