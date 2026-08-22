const { CONFIG } = require('../config');

/**
 * Recursive character text splitter.
 *
 * Tries separators in order — paragraph, line, sentence, word, character — and only
 * falls to a finer one when a piece is still too big. That keeps semantic units intact
 * instead of slicing mid-sentence.
 */
function splitText(text, opts = {}) {
  const chunkSize = opts.chunkSize ?? CONFIG.rag.chunkSize;
  const chunkOverlap = opts.chunkOverlap ?? CONFIG.rag.chunkOverlap;
  const separators = opts.separators ?? CONFIG.rag.separators;

  return recurse(String(text ?? ''), separators, chunkSize, chunkOverlap);
}

function recurse(text, separators, chunkSize, chunkOverlap) {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= chunkSize) return [trimmed];

  // Pick the first separator that actually occurs in this text.
  let separator = '';
  let remaining = [];
  for (let i = 0; i < separators.length; i++) {
    const candidate = separators[i];
    if (candidate === '' || text.includes(candidate)) {
      separator = candidate;
      remaining = separators.slice(i + 1);
      break;
    }
  }

  const pieces = separator === '' ? Array.from(text) : text.split(separator);

  const chunks = [];
  const buffer = [];

  const flush = () => {
    if (!buffer.length) return;
    chunks.push(...merge(buffer, separator, chunkSize, chunkOverlap));
    buffer.length = 0;
  };

  for (const piece of pieces) {
    if (piece.length <= chunkSize) {
      buffer.push(piece);
      continue;
    }
    // Piece is oversized on its own — flush what we have, then split it more finely.
    flush();
    if (remaining.length) {
      chunks.push(...recurse(piece, remaining, chunkSize, chunkOverlap));
    } else {
      for (let i = 0; i < piece.length; i += chunkSize) {
        chunks.push(piece.slice(i, i + chunkSize));
      }
    }
  }
  flush();

  return chunks.map((c) => c.trim()).filter(Boolean);
}

/** Greedily pack pieces up to chunkSize, carrying `chunkOverlap` characters forward. */
function merge(pieces, separator, chunkSize, chunkOverlap) {
  const sepLen = separator.length;
  const chunks = [];
  let current = [];
  let total = 0;

  for (const piece of pieces) {
    const added = piece.length + (current.length ? sepLen : 0);

    if (total + added > chunkSize && current.length) {
      chunks.push(current.join(separator));

      // Drop from the front until the tail fits inside the overlap budget.
      while (current.length && total > chunkOverlap) {
        const removed = current.shift();
        total -= removed.length + (current.length ? sepLen : 0);
      }
    }

    current.push(piece);
    total += piece.length + (current.length > 1 ? sepLen : 0);
  }

  if (current.length) chunks.push(current.join(separator));
  return chunks;
}

module.exports = { splitText };
