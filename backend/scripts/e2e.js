/* End-to-end check against a running API. Usage: node scripts/e2e.js [baseUrl] */
const BASE = process.argv[2] || 'https://hrms-platform-monh.onrender.com';
const PASS = 'Dayflow@123';
let pass = 0, fail = 0;
const results = [];

async function call(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body && method !== 'GET' && method !== 'HEAD' ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

function check(name, ok, detail = '') {
  if (ok) { pass++; results.push(`  PASS  ${name}`); }
  else { fail++; results.push(`  FAIL  ${name}${detail ? '  -> ' + detail : ''}`); }
}

async function login(identifier) {
  const r = await call('/auth/login', { method: 'POST', body: { identifier, password: PASS } });
  return r.json?.token;
}

(async () => {
  console.log(`\nTarget: ${BASE}\n${'='.repeat(60)}`);

  // --- Auth -------------------------------------------------------
  const bad = await call('/auth/login', { method: 'POST', body: { identifier: 'hr@dayflow.com', password: 'wrong' } });
  check('rejects wrong password', bad.status === 401 || bad.status === 400, `got ${bad.status}`);
  check('error leaks no account info', !/not found|no such user/i.test(JSON.stringify(bad.json || {})));

  const admin = await login('hr@dayflow.com');
  const emp = await login('john.doe@dayflow.com');
  check('admin login', !!admin);
  check('employee login', !!emp);
  if (!admin || !emp) { console.log(results.join('\n')); process.exit(1); }

  const me = await call('/auth/me', { token: emp });
  check('/auth/me returns role', me.json?.role === 'EMPLOYEE', JSON.stringify(me.json).slice(0, 80));

  // --- Unauthenticated access ------------------------------------
  for (const p of ['/employees', '/attendance/me', '/timeoff/me', '/payroll/me', '/ai/chat']) {
    const isPost = p === '/ai/chat';
    const r = await call(p, isPost ? { method: 'POST', body: { messages: [{ role: 'user', content: 'x' }] } } : {});
    check(`no token blocked: ${p}`, r.status === 401, `got ${r.status}`);
  }

  // --- Forged token ----------------------------------------------
  const forged = await call('/employees', { token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4Iiwicm9sZSI6IkFETUlOIn0.bad' });
  check('forged token rejected', forged.status === 401, `got ${forged.status}`);

  // --- Employee scope --------------------------------------------
  const own = await call('/payroll/me', { token: emp });
  check('employee sees own payroll', own.status === 200, `got ${own.status}`);

  const list = await call('/employees', { token: emp });
  const first = (list.json?.employees || list.json || [])[0];
  const otherId = (list.json?.employees || list.json || []).find((e) => e.id !== me.json?.employeeId)?.id;
  if (otherId) {
    const other = await call(`/payroll/${otherId}`, { token: emp });
    check("employee blocked from other's payroll", other.status === 403, `got ${other.status}`);
    const sal = await call(`/employees/${otherId}/salary`, { token: emp });
    check("employee blocked from other's salary", sal.status === 403, `got ${sal.status}`);
  }
  const adminQueue = await call('/timeoff?status=PENDING', { token: emp });
  check('employee blocked from admin queue', adminQueue.status === 403, `got ${adminQueue.status}`);

  // --- Admin scope ------------------------------------------------
  const aList = await call('/employees', { token: admin });
  check('admin lists employees', aList.status === 200, `got ${aList.status}`);
  const aQueue = await call('/timeoff?status=PENDING', { token: admin });
  check('admin sees pending queue', aQueue.status === 200, `got ${aQueue.status}`);

  // --- AI ---------------------------------------------------------
  const aiEmp = await call('/ai/chat', { method: 'POST', token: emp, body: { messages: [{ role: 'user', content: 'how many leaves do I have left?' }] } });
  check('AI answers employee', aiEmp.status === 200 && aiEmp.json?.steps?.length > 0, `steps=${aiEmp.json?.steps?.length}`);
  check('AI used a tool, not memory', aiEmp.json?.steps?.some((s) => s.ok));

  const aiBlock = await call('/ai/chat', { method: 'POST', token: emp, body: { messages: [{ role: 'user', content: 'what is the salary of the accounts manager?' }] } });
  check('AI refuses cross-employee salary', !!aiBlock.json?.blocked, JSON.stringify(aiBlock.json?.blocked));

  const aiAdmin = await call('/ai/chat', { method: 'POST', token: admin, body: { messages: [{ role: 'user', content: 'what is the salary of the accounts manager?' }] } });
  check('AI answers same question for admin', aiAdmin.status === 200 && !aiAdmin.json?.blocked);

  const aiPolicy = await call('/ai/chat', { method: 'POST', token: emp, body: { messages: [{ role: 'user', content: 'what is the notice period?' }] } });
  check('AI cites a policy source', (aiPolicy.json?.sources || []).length > 0);

  const aiJunk = await call('/ai/chat', { method: 'POST', token: emp, body: { messages: [{ role: 'user', content: 'what is the capital of France?' }] } });
  const junkReply = (aiJunk.json?.reply || '').toLowerCase();
  check('AI does not answer off-topic from memory', !junkReply.includes('paris'), junkReply.slice(0, 60));

  // --- Validation -------------------------------------------------
  const badBody = await call('/ai/chat', { method: 'POST', token: emp, body: {} });
  check('AI rejects empty body', badBody.status === 400, `got ${badBody.status}`);
  const badLeave = await call('/timeoff', { method: 'POST', token: emp, body: { type: 'NOPE', startDate: 'x', endDate: 'y', days: -1 } });
  check('leave rejects invalid payload', badLeave.status === 400, `got ${badLeave.status}`);

  console.log(results.join('\n'));
  console.log('='.repeat(60));
  console.log(`${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})();
