const express = require('express');
const { authJwt } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { CONFIG } = require('../ai/config');

const router = express.Router();

/**
 * Intelligent local HR assistant response generator for demo/fallback mode
 */
function getLocalHrFallback(promptText, user) {
  const q = (promptText || '').toLowerCase();
  const role = user?.role || 'EMPLOYEE';
  const userName = user?.name || user?.fullName || 'team member';

  if (q.includes('leave') || q.includes('timeoff') || q.includes('vacation') || q.includes('sick')) {
    return {
      reply: `📅 **Dayflow Leave Rules & Policies**:\n\n` +
        `• **Paid Leave Quota**: 18 days per calendar year.\n` +
        `• **Sick Leave Quota**: 10 days per calendar year.\n` +
        `• **Unpaid Leave**: Subject to HR Admin approval.\n` +
        `• **Application Workflow**: Submit requests under the **Time-Off** tab with start/end dates and reason.`,
      sources: ['HR Policy Manual - Section 4.2']
    };
  }

  if (q.includes('salary') || q.includes('payroll') || q.includes('wage') || q.includes('payslip') || q.includes('pay')) {
    if (role !== 'ADMIN' && (q.includes('other') || q.includes('john') || q.includes('priya') || q.includes('all'))) {
      return {
        reply: `🔒 I cannot share individual salary structures of other employees. Access is restricted according to Dayflow security policy.`,
        blocked: { reason: 'Access restricted: Salary details of other employees can only be viewed by Admin role.', policy: role }
      };
    }
    return {
      reply: `💰 **Dayflow Payroll Structure Engine**:\n\n` +
        `• **Basic Salary**: 50.00% of Gross Wage\n` +
        `• **HRA**: 50.00% of Basic Salary\n` +
        `• **Standard Allowance**: ₹4,167 fixed\n` +
        `• **Performance Bonus & LTA**: 8.33% of Basic Salary each\n` +
        `• **Deductions**: PF (12% of Basic) + Professional Tax (₹200)\n\n` +
        `You can view your detailed breakdown under the **Payroll** tab.`,
      sources: ['Payroll Guidelines 2026']
    };
  }

  if (q.includes('employee') || q.includes('who') || q.includes('staff') || q.includes('team') || q.includes('count')) {
    return {
      reply: `👥 **Dayflow Team Overview**:\n\n` +
        `• **Total Active Employees**: 4 registered employees in database.\n` +
        `• **Departments**: Human Resources, Engineering, Finance.\n` +
        `• **Primary Office Location**: Gandhinagar, Gujarat.\n` +
        `• **Admin Role**: ${role === 'ADMIN' ? 'You have full management access to create and edit employee profiles.' : 'You have view & self-profile edit permissions.'}`,
      sources: ['Employee Directory']
    };
  }

  return {
    reply: `👋 Hello ${userName}! I am your Dayflow AI Assistant.\n\n` +
      `You can ask me questions regarding:\n` +
      `1. **Leave policies & balances** ("What are company leave rules?")\n` +
      `2. **Payroll & salary components** ("How is take-home pay calculated?")\n` +
      `3. **Team presence & attendance** ("Who is on leave today?")\n` +
      `4. **Profile & account updates** ("How do I update my contact details?")`,
    sources: ['Dayflow Assistant v2']
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
        steps: [{ tool: 'local_hr_engine', label: 'Local Rule Engine', ok: true }],
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
        steps: [{ tool: 'local_hr_engine', label: 'Local Fallback Engine', ok: true }],
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
router.post('/query', authJwt, handleChat);

module.exports = router;

