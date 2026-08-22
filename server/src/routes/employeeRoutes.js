const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/errorHandler');
const { authJwt, requireAdmin } = require('../middleware/auth');
const employeeService = require('../services/employeeService');

const router = express.Router();

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().optional(),
  jobPosition: z.string().optional(),
  department: z.string().optional(),
  manager: z.string().optional().nullable(),
  location: z.string().optional(),
  dateOfJoining: z.string().min(1),
});

const salarySchema = z.object({
  wage: z.number().nonnegative(),
  workingDaysPerWeek: z.number().optional(),
  breakMinutes: z.number().optional(),
  hoursPerDay: z.number().optional(),
});

router.use(authJwt);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await employeeService.listEmployees(req.user, { search: req.query.search });
    res.json(data);
  })
);

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);
    const data = await employeeService.createEmployee(req.user, body);
    res.status(201).json(data);
  })
);

router.get(
  '/:id/salary',
  asyncHandler(async (req, res) => {
    // AuthZ message comes from service (contract: HR officers only)
    const data = await employeeService.getSalary(req.user, req.params.id);
    res.json(data);
  })
);

router.put(
  '/:id/salary',
  asyncHandler(async (req, res) => {
    const body = salarySchema.parse({
      ...req.body,
      wage: Number(req.body.wage),
    });
    const data = await employeeService.putSalary(req.user, req.params.id, body);
    res.json(data);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await employeeService.getEmployeeById(req.user, req.params.id);
    res.json(data);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await employeeService.patchEmployee(req.user, req.params.id, req.body);
    res.json(data);
  })
);

module.exports = router;
