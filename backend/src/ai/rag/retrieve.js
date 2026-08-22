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
  const topK = opts.topK || CONFIG.rag.topK;
  const threshold = opts.scoreThreshold != null ? opts.scoreThreshold : CONFIG.rag.scoreThreshold;

  await initStore();

  const vector = await embedOne(query);
  const hits = await search(vector, topK);

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
