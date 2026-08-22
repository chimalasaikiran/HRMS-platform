const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/errorHandler');
const { authJwt, requireAdmin } = require('../middleware/auth');
const timeOffService = require('../services/timeOffService');

const router = express.Router();

const createSchema = z.object({
  type: z.enum(['PAID', 'SICK', 'UNPAID']),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  days: z.number().positive(),
  reason: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

router.use(authJwt);

router.get(
  '/allocations/me',
  asyncHandler(async (req, res) => {
    const data = await timeOffService.getAllocations(req.user);
    res.json(data);
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const data = await timeOffService.listMine(req.user);
    res.json(data);
  })
);

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = await timeOffService.listAll(req.user, { status: req.query.status });
    res.json(data);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = createSchema.parse({
      ...req.body,
      days: Number(req.body.days),
    });
    const data = await timeOffService.createRequest(req.user, body);
    res.status(201).json(data);
  })
);

router.patch(
  '/:id/approve',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = await timeOffService.approve(req.user, req.params.id, {
      comment: req.body?.comment,
    });
    res.json(data);
  })
);

router.patch(
  '/:id/reject',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = await timeOffService.reject(req.user, req.params.id, {
      comment: req.body?.comment,
    });
    res.json(data);
  })
);

module.exports = router;
