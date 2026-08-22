const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authJwt, requireAdmin } = require('../middleware/auth');
const attendanceService = require('../services/attendanceService');

const router = express.Router();

router.use(authJwt);

router.post(
  '/check-in',
  asyncHandler(async (req, res) => {
    const data = await attendanceService.checkIn(req.user);
    res.json(data);
  })
);

router.post(
  '/check-out',
  asyncHandler(async (req, res) => {
    const data = await attendanceService.checkOut(req.user);
    res.json(data);
  })
);

router.get(
  '/me/summary',
  asyncHandler(async (req, res) => {
    const data = await attendanceService.mySummary(req.user, req.query.month);
    res.json(data);
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const data = await attendanceService.myAttendance(req.user, req.query.month);
    res.json(data);
  })
);

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = await attendanceService.adminDayView(req.user, req.query.date);
    res.json(data);
  })
);

module.exports = router;
