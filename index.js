// Entry point: scrape Hacker News for bioelectricity keywords and post new
// matches to a Telegram channel.
//
// Required env vars:
//   TELEGRAM_BOT_TOKEN   bot token from @BotFather
//   TELEGRAM_CHANNEL_ID  channel id (e.g. -1001234567890) or @username
// Optional env vars:
//   DRY_RUN=1            log what would be posted without sending or saving
//   CONFIG_PATH          path to config.json (default: ./config.json)
//   STATE_PATH           path to dedup state (default: ./state/posted.json)

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { fetchMatchingStories } from "./lib/hn.js";
import { formatStory, sendMessage } from "./lib/telegram.js";
import { loadPosted, savePosted } from "./lib/state.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONFIG_PATH = resolve(process.env.CONFIG_PATH || `${__dirname}/config.json`);
const STATE_PATH = resolve(process.env.STATE_PATH || `${__dirname}/state/posted.json`);
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

async function loadConfig(path) {
  const raw = await readFile(path, "utf8");
  const config = JSON.parse(raw);
  if (!config.keywords || Object.keys(config.keywords).length === 0) {
    throw new Error("config.keywords is empty");
  }
  config.defaultMinScore ??= 10;
  config.lookbackDays ??= 7;
  config.maxPostsPerRun ??= 15;
  return config;
}

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;

  if (!DRY_RUN && (!token || !chatId)) {
    throw new Error(
      "Missing TELEGRAM_BOT_TOKEN and/or TELEGRAM_CHANNEL_ID. Set them, or run with DRY_RUN=1."
    );
  }

  const config = await loadConfig(CONFIG_PATH);
  console.log(
    `Scanning HN for ${Object.keys(config.keywords).length} keywords ` +
      `(lookback ${config.lookbackDays}d, default min score ${config.defaultMinScore})...`
  );

  const posted = await loadPosted(STATE_PATH);
  const stories = await fetchMatchingStories(config);

  const fresh = stories.filter((s) => !posted.has(s.objectID)).slice(0, config.maxPostsPerRun);

  console.log(`Found ${stories.length} matching stories, ${fresh.length} new to post.`);

  if (fresh.length === 0) {
    console.log("Nothing new. Done.");
    return;
  }

  let postedCount = 0;
  for (const story of fresh) {
    const text = formatStory(story);
    if (DRY_RUN) {
      console.log("\n--- DRY RUN, would post ---\n" + text);
      posted.add(story.objectID);
      postedCount++;
      continue;
    }

    try {
      await sendMessage({ token, chatId, text });
      posted.add(story.objectID);
      postedCount++;
      console.log(`Posted: [${story.points}pts] ${story.title}`);
      // Be gentle with Telegram rate limits (~20 msgs/min to a channel).
      await new Promise((r) => setTimeout(r, 3500));
    } catch (err) {
      console.error(`Failed to post "${story.title}": ${err.message}`);
    }
  }

  if (!DRY_RUN) {
    await savePosted(STATE_PATH, posted);
  }

  console.log(`Done. Posted ${postedCount} stor${postedCount === 1 ? "y" : "ies"}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
