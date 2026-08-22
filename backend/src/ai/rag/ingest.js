const fs = require('fs/promises');
const path = require('path');
const { CONFIG } = require('../config');
const { splitText } = require('./chunker');
const { embed } = require('./embedder');
const { initStore, upsert, countPoints, storeMode } = require('./store');

const POLICY_DIR = path.join(__dirname, 'policies');

/**
 * Split a policy document on its `##` headings before chunking.
 *
 * This is what lets every answer cite a section rather than just a filename —
 * "Leave Policy · Medical certificates" instead of "leave-policy.md".
 */
function parseSections(markdown) {
  let docName = 'Untitled';
  const sections = [];
  let current = null;

  for (const line of markdown.split('\n')) {
    const h1 = line.match(/^#\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);

    if (h1) {
      docName = h1[1].trim();
      continue;
    }
    if (h2) {
      if (current) sections.push(current);
      current = { section: h2[1].trim(), lines: [] };
      continue;
    }
    if (!current) current = { section: 'Overview', lines: [] };
    current.lines.push(line);
  }
  if (current) sections.push(current);

  return {
    docName,
    sections: sections
      .map((s) => ({ section: s.section, text: s.lines.join('\n').trim() }))
      .filter((s) => s.text),
  };
}

async function ingest({ reset = false } = {}) {
  await initStore({ reset });

  const files = (await fs.readdir(POLICY_DIR)).filter((f) => f.endsWith('.md'));
  if (!files.length) throw new Error(`No policy documents found in ${POLICY_DIR}`);

  const records = [];
  let id = 1;

  for (const file of files) {
    const raw = await fs.readFile(path.join(POLICY_DIR, file), 'utf8');
    const { docName, sections } = parseSections(raw);

    for (const { section, text } of sections) {
      const chunks = splitText(text);
      if (!chunks.length) continue;

      const vectors = await embed(chunks);

      chunks.forEach((chunk, i) => {
        records.push({
          id: id++,
          vector: vectors[i],
          payload: { text: chunk, docName, section, file, chunkIndex: i },
        });
      });

      console.log(`  ${docName} · ${section} -> ${chunks.length} chunk(s)`);
    }
  }

  await upsert(records);
  return { chunks: records.length, files: files.length };
}

module.exports = { ingest, parseSections };

// Run directly:  npm run ingest  [--reset]
if (require.main === module) {
  const reset = process.argv.includes('--reset');
  console.log(
    `[ingest] chunk ${CONFIG.rag.chunkSize} / overlap ${CONFIG.rag.chunkOverlap} · ${CONFIG.rag.embeddingModel}`
  );
  console.log('[ingest] loading embedding model (first run downloads ~25MB)...\n');

  ingest({ reset })
    .then(async ({ chunks, files }) => {
      console.log(`\n[ingest] ${chunks} chunks from ${files} document(s) -> ${storeMode()} store`);
      console.log(`[ingest] total points in store: ${await countPoints()}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[ingest] failed:', err.message);
      process.exit(1);
    });
}
