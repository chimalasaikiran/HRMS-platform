require('dotenv').config();

/**
 * Every tunable the AI layer uses. Change values here, not inline.
 */
const CONFIG = {
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    /** Swap to this if tool-call reliability slips. */
    fallbackModel: 'moonshotai/kimi-k2-instruct',
    /** Zero on tool-calling turns — the model must not get creative with data. */
    temperature: 0,
    /** 'low' keeps routine lookups fast. */
    reasoningEffort: 'low',
    /** Safety valve: stop the tool loop after this many rounds. */
    maxToolRounds: 4,
  },

  rag: {
    collection: 'hr_policies',
    embeddingModel: 'Xenova/all-MiniLM-L6-v2',
    vectorSize: 384,
    distance: 'Cosine',

    /**
     * 800, not the usual 1000+, because all-MiniLM-L6-v2 truncates at 256 word-piece
     * tokens (~1000 chars). Chunk larger and the tail of every chunk is silently
     * dropped before it is ever embedded.
     */
    chunkSize: 800,
    chunkOverlap: 120,
    separators: ['\n\n', '\n', '. ', ' ', ''],

    topK: 4,
    /**
     * Below this cosine score we return nothing and the agent must refuse.
     * Tuned on real questions: legitimate hits landed 0.39–0.60, off-topic under 0.30.
     */
    scoreThreshold: 0.35,
  },

  qdrant: {
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY || undefined,
  },
};

module.exports = { CONFIG };
