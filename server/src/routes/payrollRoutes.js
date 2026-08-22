const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authJwt, requireAdmin } = require('../middleware/auth');
const payrollService = require('../services/payrollService');

const router = express.Router();

router.use(authJwt);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const data = await payrollService.payrollMe(req.user, req.query.month);
    res.json(data);
  })
);

router.get(
  '/:employeeId',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = await payrollService.payrollByEmployee(
      req.user,
      req.params.employeeId,
      req.query.month
    );
    res.json(data);
  })
);

module.exports = router;
