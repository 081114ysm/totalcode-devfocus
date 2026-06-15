import logger from "../config/logger.js";

export async function sendDiscord(content) {
  if (!process.env.DISCORD_WEBHOOK_URL) return { skipped: true };
  const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: String(content).slice(0, 1900) }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Discord webhook failed: ${response.status}`);
  return { skipped: false };
}

export function sendErrorAlert(message, context) {
  sendDiscord(`[DevFocus error] ${context}: ${message}`).catch((error) =>
    logger.warn("discord alert failed", { error: error.message })
  );
}
