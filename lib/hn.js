// Hacker News scraping via the public Algolia HN Search API.
// Docs: https://hn.algolia.com/api
//
// We query each configured keyword, restrict results to a recent time window
// and a minimum points threshold, then enforce that the keyword actually
// appears in the story TITLE (Algolia full-text search also matches url/text,
// so we re-check the title ourselves to honor "title-only" matching).

const ALGOLIA_SEARCH_URL = "https://hn.algolia.com/api/v1/search";

/**
 * @typedef {Object} Story
 * @property {string} objectID
 * @property {string} title
 * @property {string|null} url
 * @property {number} points
 * @property {number} num_comments
 * @property {string} author
 * @property {number} created_at_i
 * @property {string} matchedKeyword
 */

/**
 * Build the canonical HN discussion link for a story.
 * @param {string} objectID
 */
export function hnItemUrl(objectID) {
  return `https://news.ycombinator.com/item?id=${objectID}`;
}

/**
 * Query Algolia for a single keyword.
 * @param {string} keyword
 * @param {number} minScore
 * @param {number} sinceEpoch unix seconds; only stories created at/after this
 * @returns {Promise<Story[]>}
 */
async function searchKeyword(keyword, minScore, sinceEpoch) {
  const numericFilters = [
    `points>=${minScore}`,
    `created_at_i>=${sinceEpoch}`,
  ].join(",");

  const params = new URLSearchParams({
    query: keyword,
    tags: "story",
    numericFilters,
    hitsPerPage: "50",
  });

  const url = `${ALGOLIA_SEARCH_URL}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "hn-bioelectricity-telegram-bot" },
  });

  if (!res.ok) {
    throw new Error(`Algolia request failed for "${keyword}": ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const needle = keyword.toLowerCase();

  return (data.hits || [])
    // Enforce title-only matching (Algolia also matches url/story_text).
    .filter((hit) => typeof hit.title === "string" && hit.title.toLowerCase().includes(needle))
    .map((hit) => ({
      objectID: String(hit.objectID),
      title: hit.title,
      url: hit.url || null,
      points: hit.points ?? 0,
      num_comments: hit.num_comments ?? 0,
      author: hit.author || "unknown",
      created_at_i: hit.created_at_i ?? 0,
      matchedKeyword: keyword,
    }));
}

/**
 * Fetch all matching stories across every configured keyword.
 * Deduplicates by objectID, keeping the first matched keyword.
 *
 * @param {Object} config
 * @returns {Promise<Story[]>}
 */
export async function fetchMatchingStories(config) {
  const { keywords, defaultMinScore, lookbackDays } = config;
  const sinceEpoch = Math.floor(Date.now() / 1000) - lookbackDays * 24 * 60 * 60;

  const entries = Object.entries(keywords);
  const results = await Promise.all(
    entries.map(([keyword, score]) =>
      searchKeyword(keyword, score == null ? defaultMinScore : score, sinceEpoch).catch((err) => {
        console.error(`  ! ${err.message}`);
        return [];
      })
    )
  );

  /** @type {Map<string, Story>} */
  const byId = new Map();
  for (const story of results.flat()) {
    if (!byId.has(story.objectID)) {
      byId.set(story.objectID, story);
    }
  }

  // Oldest first so the channel reads chronologically.
  return [...byId.values()].sort((a, b) => a.created_at_i - b.created_at_i);
}
