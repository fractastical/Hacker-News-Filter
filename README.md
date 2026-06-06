# HN → Bioelectricity Nexus → Telegram bot

Scrapes Hacker News for bioelectricity-related keywords and posts new matches to
a Telegram channel for [bioelectricitynexus.com](https://bioelectricitynexus.com).

It is a modern reinterpretation of the original **Hacker News Filter** Chrome
extension (see [`README.textile`](./README.textile)): instead of *hiding*
stories in your browser based on keyword + karma rules, it *finds* the stories
matching your keywords (in the title) above a points threshold and pushes them
to a channel automatically.

- **Zero dependencies** — plain Node.js (v18+) using built-in `fetch`.
- **Free to run** — scheduled via GitHub Actions, no server required.
- **No duplicate posts** — posted story IDs are tracked in `state/posted.json`.

## How it works

1. For each keyword in `config.json`, it queries the public
   [Algolia HN Search API](https://hn.algolia.com/api) for recent stories that
   meet the keyword's minimum points threshold.
2. It keeps only stories where the keyword actually appears in the **title**
   (case-insensitive substring match).
3. New stories (not already in `state/posted.json`) are posted to your Telegram
   channel, oldest first.
4. The updated state file is committed back to the repo by the workflow.

## Configuration — `config.json`

```json
{
  "defaultMinScore": 10,
  "lookbackDays": 7,
  "maxPostsPerRun": 15,
  "keywords": {
    "bioelectricity": 1,
    "regeneration": 25,
    "developmental biology": 15
  }
}
```

| Field             | Meaning                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `keywords`        | Map of **title keyword → minimum HN points** to post. Keys are also the search queries.  |
| `defaultMinScore` | Used for any keyword whose value is `null`.                                              |
| `lookbackDays`    | Only consider stories created within this many days.                                     |
| `maxPostsPerRun`  | Safety cap on posts per run (avoids flooding the channel on first run).                   |

This directly mirrors the original extension's `{ "keyword": karma }` concept —
e.g. `"regeneration": 25` means *"post stories whose title contains
'regeneration' only if they have at least 25 points."* Matching is substring
based, so `"bioelectric"` also catches `"bioelectricity"`.

## Setup

### 1. Create a Telegram bot and channel

1. Message [@BotFather](https://t.me/BotFather), run `/newbot`, and copy the
   **bot token**.
2. Create your channel and add the bot as an **administrator** (it must be able
   to post messages).
3. Get the **channel id**: either use the public `@yourchannel` username, or for
   private channels the numeric id like `-1001234567890` (forward a channel post
   to [@userinfobot](https://t.me/userinfobot), or check
   `https://api.telegram.org/bot<TOKEN>/getUpdates`).

### 2. Add GitHub repository secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret                | Value                                  |
| --------------------- | -------------------------------------- |
| `TELEGRAM_BOT_TOKEN`  | The token from BotFather               |
| `TELEGRAM_CHANNEL_ID` | `@yourchannel` or `-1001234567890`     |

### 3. Enable the workflow

The schedule lives in
[`.github/workflows/post-to-telegram.yml`](./.github/workflows/post-to-telegram.yml)
and runs **every 2 hours** by default. Trigger it manually anytime from the
repo's **Actions** tab → *Post HN bioelectricity stories to Telegram* → *Run
workflow*. (The workflow needs `contents: write` permission, already set, so it
can commit the dedup state back.)

## Running locally

```bash
# Preview matches without posting or saving state:
npm run dry-run

# Actually post (requires the env vars):
export TELEGRAM_BOT_TOKEN="123456:abc..."
export TELEGRAM_CHANNEL_ID="@yourchannel"
npm start
```

### Environment variables

| Variable              | Required        | Description                                   |
| --------------------- | --------------- | --------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`  | yes (unless dry)| Bot token from BotFather                       |
| `TELEGRAM_CHANNEL_ID` | yes (unless dry)| Channel id or `@username`                      |
| `DRY_RUN`             | no              | `1` to log instead of posting                  |
| `CONFIG_PATH`         | no              | Override path to `config.json`                 |
| `STATE_PATH`          | no              | Override path to `state/posted.json`           |

## Project layout

```
index.js                 # entry point (orchestration)
config.json              # keywords + thresholds
lib/hn.js                # Algolia HN search + title/score filtering
lib/telegram.js          # Telegram Bot API client + message formatting
lib/state.js             # dedup state (read/write posted IDs)
state/posted.json        # committed list of already-posted story IDs
.github/workflows/       # scheduled GitHub Actions runner
src/                     # original Chrome extension (legacy, see README.textile)
```

## Notes & tuning

- **Niche keywords + high thresholds = few posts.** The defaults are
  intentionally conservative. Lower thresholds or raise `lookbackDays` to widen
  the net.
- **Substring matching** can over-match very short keywords (e.g. a 2-letter
  keyword could appear inside unrelated words). The bioelectricity keywords are
  long and specific, so this is rarely an issue — but keep it in mind if you add
  short terms.
- **Rate limiting:** the bot waits ~3.5s between posts to stay under Telegram's
  channel rate limits.
