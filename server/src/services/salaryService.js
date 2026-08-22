const { round2 } = require('../utils/dates');

/**
 * Wage in → all components. Fixed Allowance is the balancing item.
 * At wage 50000: Basic 25000, HRA 12500, STD 4167, Bonus 2082.50, LTA 2082.50, Fixed 4168, Net 46800.
 */
function computeSalary(wageInput) {
  const wage = round2(wageInput);
  const basic = round2(wage * 0.5);
  const hra = round2(basic * 0.5);
  const std = round2(4167);
  const bonus = round2(basic * 0.0833);
  const lta = round2(basic * 0.0833);
  const fixed = round2(wage - (basic + hra + std + bonus + lta));

  const pfEmployee = round2(basic * 0.12);
  const pfEmployer = round2(basic * 0.12);
  const ptax = round2(200);

  const gross = round2(basic + hra + std + bonus + lta + fixed);
  const netPay = round2(gross - pfEmployee - ptax);

  const pctOfBasic = (amount) => (basic === 0 ? 0 : round2((amount / basic) * 100));
  const pctOfWage = (amount) => (wage === 0 ? 0 : round2((amount / wage) * 100));

  return {
    wage,
    earnings: [
      { key: 'BASIC', label: 'Basic Salary', amount: basic, percent: 50.0 },
      { key: 'HRA', label: 'House Rent Allowance', amount: hra, percent: 50.0 },
      { key: 'STD', label: 'Standard Allowance', amount: std, percent: pctOfBasic(std) },
      { key: 'BONUS', label: 'Performance Bonus', amount: bonus, percent: 8.33 },
      { key: 'LTA', label: 'Leave Travel Allowance', amount: lta, percent: 8.33 },
      { key: 'FIXED', label: 'Fixed Allowance', amount: fixed, percent: pctOfWage(fixed) },
    ],
    deductions: [
      { key: 'PF_EMPLOYEE', label: 'PF — employee', amount: pfEmployee, percent: 12.0 },
      { key: 'PF_EMPLOYER', label: 'PF — employer', amount: pfEmployer, percent: 12.0 },
      { key: 'PTAX', label: 'Professional Tax', amount: ptax },
    ],
    gross,
    netPay,
  };
}

function toSalaryResponse(employee) {
  const s = employee.salary || {};
  const computed = computeSalary(s.wage || 0);
  return {
    wage: computed.wage,
    workingDaysPerWeek: s.workingDaysPerWeek ?? 5,
    breakMinutes: s.breakMinutes ?? 60,
    hoursPerDay: s.hoursPerDay ?? 8,
    earnings: computed.earnings,
    deductions: computed.deductions,
    gross: computed.gross,
    netPay: computed.netPay,
  };
}

module.exports = { computeSalary, toSalaryResponse };
