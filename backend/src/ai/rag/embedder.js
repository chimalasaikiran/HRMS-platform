const { CONFIG } = require('../config');

/**
 * all-MiniLM-L6-v2 running in-process. No API key, no cost, no network at query time
 * once the weights are cached (first call downloads ~25MB).
 *
 * Output is mean-pooled and L2-normalised, so a dot product IS cosine similarity.
 *
 * NOTE: @xenova/transformers is ESM-only, so it must be pulled in with a dynamic
 * import() rather than require(). The promise is cached so the model loads once.
 */
let extractorPromise = null;

function loadModel() {
  if (!extractorPromise) {
    extractorPromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', CONFIG.rag.embeddingModel, { quantized: true })
    );
  }
  return extractorPromise;
}

async function embed(texts) {
  const list = Array.isArray(texts) ? texts : [texts];
  const extract = await loadModel();

  const vectors = [];
  for (const text of list) {
    const output = await extract(text, { pooling: 'mean', normalize: true });
    vectors.push(Array.from(output.data));
  }
  return vectors;
}

async function embedOne(text) {
  const [vector] = await embed(text);
  return vector;
}

module.exports = { loadModel, embed, embedOne };
