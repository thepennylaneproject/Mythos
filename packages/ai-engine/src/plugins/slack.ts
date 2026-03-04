/**
 * Slack Plugin: Send notifications to Slack channels.
 */
import { registerNativePlugin, PluginPayload } from "../plugin-registry";

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

/**
 * Format a Mythos event into a Slack message.
 */
function formatSlackMessage(payload: PluginPayload): {
  text: string;
  blocks?: any[];
} {
  const { event, data, timestamp } = payload;

  switch (event) {
    case "post.published":
      return {
        text: `✅ Post published on ${data.channel}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*✅ Post Published*\n\n*Channel:* ${data.channel}\n*Caption:* ${data.caption?.substring(0, 100)}...`,
            },
          },
          {
            type: "context",
            elements: [
              { type: "mrkdwn", text: `Published at ${new Date(timestamp).toLocaleString()}` },
            ],
          },
        ],
      };

    case "post.failed":
      return {
        text: `❌ Post failed on ${data.channel}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*❌ Post Failed*\n\n*Channel:* ${data.channel}\n*Error:* ${data.errorMessage}`,
            },
          },
        ],
      };

    case "campaign.started":
      return {
        text: `🚀 Campaign started: ${data.campaignName}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🚀 Campaign Started*\n\n*Name:* ${data.campaignName}\n*Goal:* ${data.goal || "Not specified"}`,
            },
          },
        ],
      };

    case "member.upgraded":
      return {
        text: `⭐ New ${data.newTier}: @${data.handle}`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*⭐ Superfan Tier Upgrade*\n\n*@${data.handle}* is now a *${data.newTier}*!`,
            },
          },
        ],
      };

    default:
      return { text: `Mythos event: ${event}` };
  }
}

/**
 * Send a message to Slack.
 */
export async function sendSlackNotification(
  config: SlackConfig,
  payload: PluginPayload
): Promise<void> {
  const message = formatSlackMessage(payload);

  const body = {
    ...message,
    channel: config.channel,
    username: config.username || "Mythos",
    icon_emoji: config.iconEmoji || ":sparkles:",
  };

  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.status}`);
  }
}

/**
 * Create a Slack plugin handler.
 */
export function createSlackPlugin(config: SlackConfig) {
  return async (payload: PluginPayload) => {
    await sendSlackNotification(config, payload);
  };
}
