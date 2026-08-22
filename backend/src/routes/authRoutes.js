const express = require('express');
const { z } = require('zod');
const { asyncHandler } = require('../middleware/errorHandler');
const { authJwt } = require('../middleware/auth');
const authService = require('../services/authService');

const router = express.Router();

const registerSchema = z.object({
  companyName: z.string().min(1),
  adminName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  logoUrl: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

router.post(
  '/register-company',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);
    const result = await authService.registerCompany(body);
    res.status(201).json(result);
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const result = await authService.login(body);
    res.json(result);
  })
);

router.post(
  '/change-password',
  authJwt,
  asyncHandler(async (req, res) => {
    const body = changePasswordSchema.parse(req.body);
    const result = await authService.changePassword(req.user.id, body);
    res.json(result);
  })
);

router.get(
  '/me',
  authJwt,
  asyncHandler(async (req, res) => {
    const me = await authService.getMe(req.user);
    res.json(me);
  })
);

module.exports = router;
