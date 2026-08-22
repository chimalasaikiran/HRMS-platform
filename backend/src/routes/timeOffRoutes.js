const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/errorHandler');
const { authJwt, requireAdmin } = require('../middleware/auth');
const timeOffService = require('../services/timeOffService');

const router = express.Router();

const createSchema = z
  .object({
    type: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    days: z.number().positive().optional(),
    reason: z.string().optional(),
    attachmentUrl: z.string().optional(),
  })
  .transform((data) => {
    const raw = String(data.type).trim().toUpperCase();
    const typeMap = {
      PAID: 'PAID',
      SICK: 'SICK',
      UNPAID: 'UNPAID',
      'PAID LEAVE': 'PAID',
      'SICK LEAVE': 'SICK',
      'UNPAID LEAVE': 'UNPAID',
    };
    const type = typeMap[raw] || typeMap[raw.replace(/\s+/g, ' ')];
    if (!type) {
      throw new z.ZodError([
        {
          code: 'custom',
          path: ['type'],
          message: 'type must be PAID, SICK, or UNPAID',
        },
      ]);
    }

    let days = data.days;
    if (!days || Number.isNaN(days)) {
      const start = new Date(`${data.startDate}T00:00:00Z`);
      const end = new Date(`${data.endDate}T00:00:00Z`);
      days = Math.floor((end - start) / 86400000) + 1;
    }

    return { ...data, type, days };
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
    const rawDays = req.body?.days;
    const body = createSchema.parse({
      ...req.body,
      days:
        rawDays === undefined || rawDays === null || rawDays === ''
          ? undefined
          : Number(rawDays),
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
