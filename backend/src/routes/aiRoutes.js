const express = require('express');
const { authJwt } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { chat } = require('../ai/agent');
const { CONFIG } = require('../ai/config');

const router = express.Router();

/**
 * Degrade politely instead of throwing a 500 when the AI keys are absent.
 * The rest of the API is unaffected — this only guards /api/ai.
 */
router.use((req, res, next) => {
  if (!CONFIG.groq.apiKey) {
    return res.status(503).json({
      error: {
        code: 'AI_UNAVAILABLE',
        message: 'The AI assistant is not configured on this server.',
      },
    });
  }
  next();
});

/**
 * POST /api/ai/chat
 *
 * Identity comes from the verified JWT only. The body supplies conversation text and
 * nothing else — never a role, employee id, or company id.
 */
router.post('/chat', authJwt, async (req, res, next) => {
  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || !messages.length) {
      throw new AppError('VALIDATION_ERROR', 'messages must be a non-empty array', 400);
    }

    const clean = messages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim()
      )
      .slice(-10) // keep the prompt small; this is not a memory feature
      .map((m) => ({ role: m.role, content: m.content }));

    if (!clean.length) {
      throw new AppError('VALIDATION_ERROR', 'No valid messages supplied', 400);
    }

    const result = await chat({ messages: clean, user: req.user });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
