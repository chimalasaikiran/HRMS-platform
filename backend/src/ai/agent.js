const Groq = require('groq-sdk');
const { CONFIG } = require('./config');
const { systemPrompt } = require('./prompt');
const { TOOLS, toolDefsFor, runTool, ForbiddenError } = require('./tools');

let groq = null;
function client() {
  if (!groq) {
    if (!CONFIG.groq.apiKey) throw new Error('GROQ_API_KEY is not set');
    groq = new Groq({ apiKey: CONFIG.groq.apiKey });
  }
  return groq;
}

/**
 * Run one assistant turn.
 *
 * @param {object} args
 * @param {Array}  args.messages  [{ role: 'user'|'assistant', content }]
 * @param {object} args.user      req.user from the verified JWT — never from the body
 * @returns response shaped as docs/api-contract.md describes
 */
async function chat({ messages, user }) {
  const tools = toolDefsFor(user);
  const convo = [{ role: 'system', content: systemPrompt(user) }].concat(messages);

  const steps = [];
  const blocks = [];
  const sources = [];
  let pendingAction = null;
  let blocked = null;

  for (let round = 0; round < CONFIG.groq.maxToolRounds; round++) {
    const completion = await complete(convo, tools);
    const message = completion.choices[0].message;
    convo.push(message);

    const calls = message.tool_calls || [];
    if (!calls.length) {
      return { reply: message.content || '', steps, blocks, sources, pendingAction, blocked };
    }

    for (const call of calls) {
      const name = call.function.name;
      const label = TOOLS[name] ? TOOLS[name].label : name;

      let args = {};
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch (e) {
        /* malformed args fall through to the schema error below */
      }

      let content;
      try {
        const result = await runTool(name, args, user);

        steps.push({ tool: name, label, ok: true });
        if (result.block) blocks.push(result.block);
        if (result.sources) sources.push(...result.sources);
        if (result.pendingAction) pendingAction = result.pendingAction;

        content = JSON.stringify(result.data);
      } catch (err) {
        steps.push({ tool: name, label, ok: false });

        if (err instanceof ForbiddenError) {
          // Surfaced to the UI as the padlock card. The refusal happened in code.
          blocked = { reason: err.message, policy: user.role };
          content = JSON.stringify({ error: 'FORBIDDEN', message: err.message });
        } else {
          content = JSON.stringify({ error: 'TOOL_ERROR', message: err.message });
        }
      }

      convo.push({ role: 'tool', tool_call_id: call.id, content });
    }
  }

  return {
    reply: 'I could not finish that request. Please try rephrasing it.',
    steps,
    blocks,
    sources,
    pendingAction,
    blocked,
  };
}

/** Call Groq, retrying once on the fallback model if the primary fails. */
async function complete(messages, tools) {
  const base = {
    messages,
    tools,
    tool_choice: 'auto',
    temperature: CONFIG.groq.temperature,
  };

  try {
    const extra = CONFIG.groq.model.includes('gpt-oss')
      ? { reasoning_effort: CONFIG.groq.reasoningEffort }
      : {};
    return await client().chat.completions.create(
      Object.assign({}, base, { model: CONFIG.groq.model }, extra)
    );
  } catch (err) {
    if (err && err.status === 429) {
      throw new Error('The assistant is rate limited right now. Please try again in a moment.');
    }
    console.warn(`[agent] ${CONFIG.groq.model} failed (${err.message}) — trying fallback model.`);
    return client().chat.completions.create(
      Object.assign({}, base, { model: CONFIG.groq.fallbackModel })
    );
  }
}

module.exports = { chat };
