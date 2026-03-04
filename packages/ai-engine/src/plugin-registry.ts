/**
 * Plugin Registry: Event-driven plugin system for Mythos.
 */

export type PluginEvent =
  | "post.created"
  | "post.published"
  | "post.failed"
  | "campaign.started"
  | "campaign.completed"
  | "content.generated"
  | "member.upgraded"; // superfan tier change

export interface PluginConfig {
  id: string;
  name: string;
  type: "webhook" | "native" | "oauth";
  enabled: boolean;
  events: PluginEvent[];
  webhookUrl?: string;
  secret?: string;
  headers?: Record<string, string>;
}

export interface PluginPayload {
  event: PluginEvent;
  timestamp: string;
  data: Record<string, any>;
  orgId: string;
}

export type PluginHandler = (payload: PluginPayload) => Promise<void>;

// Native plugin handlers registry
const nativeHandlers: Map<string, PluginHandler> = new Map();

/**
 * Register a native plugin handler.
 */
export function registerNativePlugin(pluginId: string, handler: PluginHandler): void {
  nativeHandlers.set(pluginId, handler);
}

/**
 * Execute a webhook plugin.
 */
async function executeWebhook(
  config: PluginConfig,
  payload: PluginPayload
): Promise<{ success: boolean; response?: any; error?: string }> {
  if (!config.webhookUrl) {
    return { success: false, error: "No webhook URL configured" };
  }

  try {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(config.headers || {}),
    };

    // Add signature if secret is configured
    if (config.secret) {
      const crypto = await import("crypto");
      const signature = crypto
        .createHmac("sha256", config.secret)
        .update(body)
        .digest("hex");
      headers["X-Mythos-Signature"] = signature;
    }

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Webhook returned ${response.status}`,
        response: await response.text(),
      };
    }

    return {
      success: true,
      response: await response.json().catch(() => null),
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Dispatch an event to all registered plugins.
 */
export async function dispatchPluginEvent(
  plugins: PluginConfig[],
  event: PluginEvent,
  data: Record<string, any>,
  orgId: string
): Promise<Array<{ pluginId: string; success: boolean; error?: string }>> {
  const payload: PluginPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
    orgId,
  };

  const results: Array<{ pluginId: string; success: boolean; error?: string }> = [];

  for (const plugin of plugins) {
    if (!plugin.enabled || !plugin.events.includes(event)) {
      continue;
    }

    if (plugin.type === "webhook") {
      const result = await executeWebhook(plugin, payload);
      results.push({ pluginId: plugin.id, ...result });
    } else if (plugin.type === "native") {
      const handler = nativeHandlers.get(plugin.id);
      if (handler) {
        try {
          await handler(payload);
          results.push({ pluginId: plugin.id, success: true });
        } catch (error: any) {
          results.push({ pluginId: plugin.id, success: false, error: error.message });
        }
      }
    }
  }

  return results;
}
