const fs = require('fs/promises');
const path = require('path');
const { CONFIG } = require('../config');

/**
 * Vector store with a deliberate escape hatch.
 *
 * Qdrant is the intended backend. If it is unreachable we fall back to a local JSON
 * file and do cosine similarity in memory — the policy corpus is only a few dozen
 * chunks, so results are identical and an infrastructure problem can never block us.
 */
const FALLBACK_FILE = path.join(__dirname, '.index.json');

let mode = null; // 'qdrant' | 'file'
let client = null;
let points = []; // file mode only

function storeMode() {
  return mode;
}

async function initStore({ reset = false } = {}) {
  if (mode && !reset) return mode;

  try {
    // ESM-only package — dynamic import, not require.
    const { QdrantClient } = await import('@qdrant/js-client-rest');
    client = new QdrantClient({ url: CONFIG.qdrant.url, apiKey: CONFIG.qdrant.apiKey });

    const { collections } = await client.getCollections();
    const exists = collections.some((c) => c.name === CONFIG.rag.collection);

    if (exists && reset) await client.deleteCollection(CONFIG.rag.collection);
    if (!exists || reset) {
      await client.createCollection(CONFIG.rag.collection, {
        vectors: { size: CONFIG.rag.vectorSize, distance: CONFIG.rag.distance },
      });
    }
    mode = 'qdrant';
  } catch (err) {
    console.warn(`[rag] Qdrant unreachable (${err.message}) — using local file index.`);
    mode = 'file';
    points = reset ? [] : await loadFile();
  }

  return mode;
}

async function upsert(records) {
  if (!records.length) return;

  if (mode === 'qdrant') {
    await client.upsert(CONFIG.rag.collection, {
      wait: true,
      points: records.map((r) => ({ id: r.id, vector: r.vector, payload: r.payload })),
    });
    return;
  }

  points.push(...records);
  await saveFile();
}

async function search(vector, topK) {
  if (mode === 'qdrant') {
    // client.query, not client.search — search() was removed in @qdrant/js-client-rest v1.19.
    const { points: hits } = await client.query(CONFIG.rag.collection, {
      query: vector,
      limit: topK,
      with_payload: true,
    });
    return hits.map((h) => ({ score: h.score, payload: h.payload }));
  }

  if (!points.length) points = await loadFile();

  return points
    .map((p) => ({ score: dot(vector, p.vector), payload: p.payload }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

async function countPoints() {
  if (mode === 'qdrant') {
    const { count } = await client.count(CONFIG.rag.collection, { exact: true });
    return count;
  }
  if (!points.length) points = await loadFile();
  return points.length;
}

/** Vectors are L2-normalised by the embedder, so a dot product is the cosine score. */
function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

async function loadFile() {
  try {
    return JSON.parse(await fs.readFile(FALLBACK_FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function saveFile() {
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(points), 'utf8');
}

module.exports = { storeMode, initStore, upsert, search, countPoints };
