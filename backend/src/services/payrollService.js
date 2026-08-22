const Employee = require('../models/Employee');
const { AppError } = require('../middleware/errorHandler');
const { toSalaryResponse } = require('./salaryService');
const { mySummary } = require('./attendanceService');
const { currentMonth, round2 } = require('../utils/dates');

async function payrollForEmployee(userCtx, employeeId, month = currentMonth()) {
  const employee = await Employee.findOne({ _id: employeeId, companyId: userCtx.companyId });
  if (!employee) throw new AppError('NOT_FOUND', 'Employee not found', 404);

  const salary = toSalaryResponse(employee);
  const summaryCtx = {
    ...userCtx,
    employeeId: employee._id.toString(),
  };
  const summary = await mySummary(summaryCtx, month);
  const ratio =
    summary.totalWorkingDays > 0 ? summary.payableDays / summary.totalWorkingDays : 0;
  const netPayable = round2(salary.netPay * ratio);

  return {
    ...salary,
    month,
    payableDays: summary.payableDays,
    totalWorkingDays: summary.totalWorkingDays,
    netPayable,
  };
}

async function payrollMe(userCtx, month = currentMonth()) {
  if (!userCtx.employeeId) {
    throw new AppError('FORBIDDEN', 'No employee profile linked to this user', 403);
  }
  return payrollForEmployee(userCtx, userCtx.employeeId, month);
}

async function payrollByEmployee(userCtx, employeeId, month = currentMonth()) {
  if (userCtx.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Salary details are visible only to HR officers.', 403);
  }
  return payrollForEmployee(userCtx, employeeId, month);
}

module.exports = { payrollMe, payrollByEmployee, payrollForEmployee };
