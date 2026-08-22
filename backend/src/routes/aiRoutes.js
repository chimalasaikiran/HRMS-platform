const express = require('express');
const { authJwt } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { CONFIG } = require('../ai/config');

const router = express.Router();

/**
 * Intelligent local HR assistant response generator for demo/fallback mode
 */
function getLocalHrFallback(promptText, user) {
  // The assistant is unavailable. Say so.
  //
  // This used to return hardcoded leave quotas, payroll rules and employee
  // counts. They were wrong (18/10 days against a real 24/7; 4 employees
  // against 9) and cited documents that do not exist. Stating unverified
  // figures as fact is the one thing this system must never do — every real
  // answer comes from a tool result or a retrieved passage, or there is no
  // answer. A degraded assistant is recoverable; a confidently wrong one is not.
  return {
    reply:
      "I can't reach the assistant right now, so I won't guess at an answer. " +
      'Your leave balance, attendance and payslip are available on their own ' +
      'tabs, and HR can help with policy questions.',
    unavailable: true,
  };
}

/**
 * Handle chat request processing
 */
async function handleChat(req, res, next) {
  try {
    const { messages, prompt } = req.body || {};

    let clean = [];

    if (Array.isArray(messages) && messages.length > 0) {
      clean = messages
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim()
        )
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
    } else if (typeof prompt === 'string' && prompt.trim()) {
      clean = [{ role: 'user', content: prompt.trim() }];
    }

    if (!clean.length) {
      throw new AppError('VALIDATION_ERROR', 'A prompt or non-empty messages array is required', 400);
    }

    const lastUserMsg = [...clean].reverse().find((m) => m.role === 'user')?.content || '';

    // If GROQ_API_KEY is missing, gracefully degrade using intelligent local HR response generator
    if (!CONFIG.groq.apiKey) {
      const fallbackResult = getLocalHrFallback(lastUserMsg, req.user);
      return res.json({
        reply: fallbackResult.reply,
        answer: fallbackResult.reply,
        steps: [{ tool: 'assistant', label: 'Assistant unavailable', ok: false }],
        blocks: [],
        sources: fallbackResult.sources || [],
        pendingAction: null,
        blocked: fallbackResult.blocked || null,
        mode: 'LOCAL_FALLBACK'
      });
    }

    // Lazy-load agent so missing optional AI packages do not crash the server on boot
    let chat;
    try {
      ({ chat } = require('../ai/agent'));
    } catch (loadErr) {
      const fallbackResult = getLocalHrFallback(lastUserMsg, req.user);
      return res.json({
        reply: fallbackResult.reply,
        answer: fallbackResult.reply,
        steps: [{ tool: 'assistant', label: 'Assistant unavailable', ok: false }],
        blocks: [],
        sources: fallbackResult.sources || [],
        pendingAction: null,
        blocked: fallbackResult.blocked || null,
        mode: 'LOCAL_FALLBACK'
      });
    }

    const result = await chat({ messages: clean, user: req.user });
    return res.json({
      ...result,
      answer: result.reply || result.answer
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/chat
 */
router.post('/chat', authJwt, handleChat);

/**
 * POST /api/ai/query (Alias for compatibility)
 */
router.post('/query', authJwt, (req, res, next) => {
  const body = req.body || {};
  if (!Array.isArray(body.messages)) {
    const text = body.query || body.message || body.prompt || body.content;
    if (typeof text === 'string' && text.trim()) {
      req.body = { ...body, messages: [{ role: 'user', content: text }] };
    }
  }
  return handleChat(req, res, next);
});

module.exports = router;
