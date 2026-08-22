require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDb } = require('./config/db');
const Company = require('./models/Company');
const User = require('./models/User');
const Employee = require('./models/Employee');
const AttendanceRecord = require('./models/AttendanceRecord');
const TimeOffRequest = require('./models/TimeOffRequest');
const { allocateLoginId } = require('./services/loginIdService');
const { todayISO } = require('./utils/dates');

const DEMO_PASSWORD = 'Dayflow@123';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayISO(d);
}

async function clearAll() {
  await Promise.all([
    AttendanceRecord.deleteMany({}),
    TimeOffRequest.deleteMany({}),
    Employee.deleteMany({}),
    User.deleteMany({}),
    Company.deleteMany({}),
  ]);
}

async function createPerson({
  companyId,
  firstName,
  lastName,
  email,
  role,
  jobPosition,
  department,
  location,
  dateOfJoining,
  wage,
  mobile,
  managerId,
  mustChangePassword = false,
}) {
  const loginId = await allocateLoginId(companyId, firstName, lastName, dateOfJoining);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await User.create({
    companyId,
    loginId,
    email: email.toLowerCase(),
    passwordHash,
    role,
    mustChangePassword,
    employeeId: null,
  });

  const employee = await Employee.create({
    companyId,
    userId: user._id,
    firstName,
    lastName,
    email: email.toLowerCase(),
    mobile: mobile || '+91 9000000000',
    jobPosition,
    department,
    managerId: managerId || null,
    location: location || 'Gandhinagar',
    dateOfJoining,
    avatarUrl: '',
    resume: {
      about: `${firstName} works in ${department}.`,
      loveAboutJob: 'Building great products',
      interests: 'Tech, cricket',
      skills: ['Communication', 'Teamwork'],
      certifications: [],
    },
    privateInfo: {
      nationality: 'Indian',
      gender: 'Other',
      residingAddress: 'Gandhinagar, Gujarat',
      bank: {
        accountNumber: 'XXXXXXXX1234',
        bankName: 'HDFC',
        ifsc: 'HDFC0001234',
        pan: 'ABCDE1234F',
        uan: '100000000000',
        empCode: loginId,
      },
    },
    salary: {
      wage: wage || 0,
      workingDaysPerWeek: 5,
      breakMinutes: 60,
      hoursPerDay: 8,
    },
  });

  user.employeeId = employee._id;
  await user.save();

  return { user, employee, loginId };
}

async function seedAttendance(companyId, employees) {
  // Last 14 calendar days
  for (let i = 13; i >= 0; i -= 1) {
    const date = daysAgo(i);
    const wd = new Date(date + 'T00:00:00').getDay();
    if (wd === 0 || wd === 6) continue;

    for (let idx = 0; idx < employees.length; idx += 1) {
      const emp = employees[idx];
      // Mix of statuses
      let status = 'PRESENT';
      let checkIn = '09:30';
      let checkOut = '18:30';
      let workMinutes = 540;
      let extraMinutes = 0;

      if (idx === 1 && i === 2) {
        status = 'LEAVE';
        checkIn = null;
        checkOut = null;
        workMinutes = 0;
      } else if ((idx + i) % 7 === 0) {
        status = 'ABSENT';
        checkIn = null;
        checkOut = null;
        workMinutes = 0;
      } else if ((idx + i) % 11 === 0) {
        status = 'HALF_DAY';
        checkIn = '09:30';
        checkOut = '13:00';
        workMinutes = 210;
      }

      await AttendanceRecord.create({
        companyId,
        employeeId: emp._id,
        date,
        checkIn,
        checkOut,
        workMinutes,
        extraMinutes,
        status,
      });
    }
  }
}

async function seed() {
  await connectDb();
  console.log('Clearing existing data...');
  await clearAll();

  const year = '2022';
  const company = await Company.create({
    name: 'Odoo India',
    logoUrl: '',
    code: 'OI',
    joiningSerialByYear: { [year]: 0, 2024: 0, 2025: 0, 2026: 0 },
  });

  console.log('Creating admin...');
  const admin = await createPerson({
    companyId: company._id,
    firstName: 'Hari',
    lastName: 'Admin',
    email: 'hr@dayflow.com',
    role: 'ADMIN',
    jobPosition: 'HR Officer',
    department: 'Human Resources',
    location: 'Gandhinagar',
    dateOfJoining: '2022-01-15',
    wage: 80000,
    mobile: '+91 9876500001',
  });

  const staffDefs = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@dayflow.com',
      jobPosition: 'Backend Developer',
      department: 'Engineering',
      dateOfJoining: '2022-03-01',
      wage: 50000,
    },
    {
      firstName: 'Priya',
      lastName: 'Shah',
      email: 'priya.shah@dayflow.com',
      jobPosition: 'Frontend Developer',
      department: 'Engineering',
      dateOfJoining: '2022-04-10',
      wage: 48000,
    },
    {
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit.patel@dayflow.com',
      jobPosition: 'Accounts Manager',
      department: 'Finance',
      dateOfJoining: '2022-02-20',
      wage: 55000,
    },
    {
      firstName: 'Neha',
      lastName: 'Mehta',
      email: 'neha.mehta@dayflow.com',
      jobPosition: 'Sales Executive',
      department: 'Sales',
      dateOfJoining: '2024-06-01',
      wage: 40000,
    },
    {
      firstName: 'Rahul',
      lastName: 'Verma',
      email: 'rahul.verma@dayflow.com',
      jobPosition: 'QA Engineer',
      department: 'Engineering',
      dateOfJoining: '2025-01-12',
      wage: 42000,
    },
    {
      firstName: 'Sneha',
      lastName: 'Iyer',
      email: 'sneha.iyer@dayflow.com',
      jobPosition: 'People Ops',
      department: 'Human Resources',
      dateOfJoining: '2022-08-18',
      wage: 45000,
    },
  ];

  console.log('Creating 6 employees...');
  const created = [];
  for (const def of staffDefs) {
    const person = await createPerson({
      companyId: company._id,
      role: 'EMPLOYEE',
      managerId: admin.employee._id,
      mustChangePassword: false,
      ...def,
    });
    created.push(person);
    console.log(`  ${person.loginId}  ${def.email}`);
  }

  console.log('Seeding attendance (2 weeks)...');
  await seedAttendance(
    company._id,
    created.map((c) => c.employee)
  );

  console.log('Seeding time-off requests...');
  await TimeOffRequest.create({
    companyId: company._id,
    employeeId: created[0].employee._id,
    type: 'SICK',
    startDate: daysAgo(1),
    endDate: daysAgo(1),
    days: 1,
    reason: 'Fever',
    status: 'PENDING',
  });

  await TimeOffRequest.create({
    companyId: company._id,
    employeeId: created[1].employee._id,
    type: 'PAID',
    startDate: daysAgo(5),
    endDate: daysAgo(4),
    days: 2,
    reason: 'Family function',
    status: 'APPROVED',
    reviewerId: admin.user._id,
    reviewComment: 'Approved',
  });

  console.log('\nSeed complete.\n');
  console.log('Demo credentials (password for all):', DEMO_PASSWORD);
  console.log('Admin email:  hr@dayflow.com');
  console.log('Admin login: ', admin.loginId);
  console.log('Employee:    john.doe@dayflow.com /', created[0].loginId);
  console.log('Wage demo:   John Doe has wage 50000\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
