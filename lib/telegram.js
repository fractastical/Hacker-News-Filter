// Minimal Telegram Bot API client (no dependencies).
// Docs: https://core.telegram.org/bots/api#sendmessage

import { hnItemUrl } from "./hn.js";

const SITE_URL = "https://bioelectricitynexus.com";
const SITE_NAME = "Bioelectricity Nexus";

/** Escape text for Telegram HTML parse mode. */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Render a single story as an HTML Telegram message.
 * @param {import("./hn.js").Story} story
 */
export function formatStory(story) {
  const title = escapeHtml(story.title);
  const externalUrl = story.url || hnItemUrl(story.objectID);
  const discussionUrl = hnItemUrl(story.objectID);
  const keyword = escapeHtml(story.matchedKeyword);

  const lines = [
    `🧬 <b><a href="${escapeHtml(externalUrl)}">${title}</a></b>`,
    "",
    `▲ ${story.points} points · 💬 ${story.num_comments} comments`,
    `🏷️ matched: <i>${keyword}</i>`,
    `🔗 <a href="${escapeHtml(discussionUrl)}">HN discussion</a> · <a href="${SITE_URL}">${SITE_NAME}</a>`,
  ];

  return lines.join("\n");
}

/**
 * Send a message to the configured channel.
 * @param {Object} opts
 * @param {string} opts.token Telegram bot token
 * @param {string} opts.chatId Channel id or @username
 * @param {string} opts.text HTML message body
 */
export async function sendMessage({ token, chatId, text }) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    const desc = data.description || `${res.status} ${res.statusText}`;
    throw new Error(`Telegram sendMessage failed: ${desc}`);
  }
  return data.result;
}
