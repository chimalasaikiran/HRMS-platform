const { CONFIG } = require('../config');
const { embedOne } = require('./embedder');
const { initStore, search } = require('./store');

/**
 * Retrieve policy passages for a question.
 *
 * Anything below the score threshold is dropped. An empty array is a valid, meaningful
 * result — it means the agent MUST refuse rather than guess. That refusal is the whole
 * anti-hallucination mechanism for policy questions, so never soften the threshold just
 * to "return something".
 */
async function searchPolicy(query, opts = {}) {
  if (!CONFIG.rag.enabled) return [];

  const topK = opts.topK || CONFIG.rag.topK;
  const threshold = opts.scoreThreshold != null ? opts.scoreThreshold : CONFIG.rag.scoreThreshold;

  let hits;
  try {
    await initStore();
    const vector = await embedOne(query);
    hits = await search(vector, topK);
  } catch (err) {
    // Out of memory, model download failure, store unreachable — an empty result
    // makes the agent say it cannot find the answer, which is correct and safe.
    // It must never take down a request that other tools could still serve.
    console.error(`[rag] retrieval unavailable: ${err.message}`);
    return [];
  }

  return hits
    .filter((h) => h.score >= threshold)
    .map((h) => ({
      text: h.payload.text,
      docName: h.payload.docName,
      section: h.payload.section,
      score: Number(h.score.toFixed(4)),
    }));
}

module.exports = { searchPolicy };
