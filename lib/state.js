// Dedup state: a JSON file of HN objectIDs we've already posted.
// Committed back to the repo by the GitHub Actions workflow so stories are
// never posted to the channel twice.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// Cap stored ids so the file can't grow forever. Plenty for a 7-day window.
const MAX_IDS = 5000;

/**
 * Load the set of already-posted objectIDs.
 * @param {string} path
 * @returns {Promise<Set<string>>}
 */
export async function loadPosted(path) {
  try {
    const raw = await readFile(path, "utf8");
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch (err) {
    if (err.code === "ENOENT") return new Set();
    throw err;
  }
}

/**
 * Persist the set of posted objectIDs (most-recent kept, oldest trimmed).
 * @param {string} path
 * @param {Set<string>} posted
 */
export async function savePosted(path, posted) {
  const arr = [...posted].slice(-MAX_IDS);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(arr, null, 2) + "\n", "utf8");
}
