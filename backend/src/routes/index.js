const express = require('express');
const authRoutes = require('./authRoutes');
const employeeRoutes = require('./employeeRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const timeOffRoutes = require('./timeOffRoutes');
const payrollRoutes = require('./payrollRoutes');
const aiRoutes = require('./aiRoutes');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timeoff', timeOffRoutes);
router.use('/payroll', payrollRoutes);
router.use('/ai', aiRoutes);

// Frontend compatibility aliases (calls without /auth prefix)
router.post('/signup', asyncHandler(authRoutes.handleSignup));
router.post('/register', asyncHandler(authRoutes.handleSignup));
router.post('/login', asyncHandler(authRoutes.handleLogin));

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'dayflow-server' });
});

module.exports = router;
