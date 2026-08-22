const crypto = require('crypto');

/**
 * Request logging.
 *
 * morgan already logs the access line. What it cannot tell you is *who* made a
 * request or how to tie an error in the logs to the response a user saw. So:
 * every request gets a short id, echoed back in the X-Request-Id header and
 * included in any error we log. When someone says "it failed", that id is the
 * whole investigation.
 *
 * User id and role are logged; nothing else about the user is. Bodies are never
 * logged — they carry passwords, salary figures and personal details.
 */
function requestLog(req, res, next) {
  req.id = crypto.randomBytes(4).toString('hex');
  res.setHeader('X-Request-Id', req.id);

  const startedAt = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - startedAt;
    // Only the interesting ones: slow, failed, or AI. Logging every 200 on a
    // free tier just buries the signal.
    const slow = ms > 2000;
    const failed = res.statusCode >= 400;
    const isAi = req.originalUrl.startsWith('/api/ai');

    if (!slow && !failed && !isAi) return;

    const who = req.user ? `${req.user.role}:${req.user.id}` : 'anon';
    console.log(
      JSON.stringify({
        id: req.id,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms,
        user: who,
        ...(slow ? { slow: true } : {}),
      })
    );
  });

  next();
}

module.exports = { requestLog };
