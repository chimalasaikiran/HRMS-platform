/**
 * Test the agent from the terminal against the real database, with no HTTP layer.
 *
 *   npm run ai -- "how many leaves do I have left?"
 *   npm run ai -- --role ADMIN "who is absent today?"
 *   npm run ai -- "what is the salary of the accounts manager?"   <- should be refused
 *   npm run ai -- "what is the notice period?"                    <- should cite a policy doc
 *
 * Picks a real user out of MongoDB so userCtx matches what authJwt would produce.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const User = require('../models/User');
const { chat } = require('./agent');

const argv = process.argv.slice(2);
const roleFlag = argv.indexOf('--role');
const wantRole = roleFlag !== -1 ? String(argv[roleFlag + 1] || '').toUpperCase() : 'EMPLOYEE';
const question = argv
  .filter((_, i) => roleFlag === -1 || (i !== roleFlag && i !== roleFlag + 1))
  .join(' ')
  .trim();

if (!question) {
  console.error('Usage: npm run ai -- [--role ADMIN] "your question"');
  process.exit(1);
}

(async () => {
  await connectDb();

  const user = await User.findOne({ role: wantRole }).lean();
  if (!user) {
    console.error(`No ${wantRole} user found. Run "npm run seed" first.`);
    process.exit(1);
  }

  const userCtx = {
    id: String(user._id),
    role: user.role,
    companyId: String(user.companyId),
    employeeId: user.employeeId ? String(user.employeeId) : null,
    loginId: user.loginId || '',
    email: user.email || '',
  };

  console.log(`\n\x1b[2m[${userCtx.role}] ${userCtx.loginId || userCtx.email}\x1b[0m`);
  console.log(`\x1b[36m> ${question}\x1b[0m\n`);

  const res = await chat({ messages: [{ role: 'user', content: question }], user: userCtx });

  if (res.steps.length) {
    console.log('\x1b[2mSteps:\x1b[0m');
    for (const s of res.steps) {
      const mark = s.ok ? '\x1b[32m/\x1b[0m' : '\x1b[31mx\x1b[0m';
      console.log(`  ${mark} ${s.label}  \x1b[2m${s.tool}()\x1b[0m`);
    }
    console.log();
  }

  console.log(res.reply || '(no reply)');

  if (res.sources.length) {
    console.log('\n\x1b[2mSources:\x1b[0m');
    for (const s of res.sources) console.log(`  - ${s.doc} / ${s.section}`);
  }
  if (res.blocks.length) {
    console.log(`\n\x1b[2mBlocks: ${res.blocks.map((b) => b.type).join(', ')}\x1b[0m`);
  }
  if (res.pendingAction) {
    console.log(`\n\x1b[33mPending action:\x1b[0m ${res.pendingAction.summary}`);
  }
  if (res.blocked) {
    console.log(`\n\x1b[31mBLOCKED:\x1b[0m ${res.blocked.reason} \x1b[2m(policy: ${res.blocked.policy})\x1b[0m`);
  }

  console.log();
  await mongoose.disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error(`\n\x1b[31mError:\x1b[0m ${err.message}\n`);
  try {
    await mongoose.disconnect();
  } catch (e) {
    /* ignore */
  }
  process.exit(1);
});
