"use client";

import { useEffect, useState } from "react";

interface Plugin {
  id: string;
  name: string;
  type: "webhook" | "native" | "oauth";
  enabled: boolean;
  events: string[];
  config?: {
    webhookUrl?: string;
  };
}

const EVENT_OPTIONS = [
  { value: "post.created", label: "Post Created" },
  { value: "post.published", label: "Post Published" },
  { value: "post.failed", label: "Post Failed" },
  { value: "campaign.started", label: "Campaign Started" },
  { value: "campaign.completed", label: "Campaign Completed" },
  { value: "member.upgraded", label: "Superfan Upgraded" },
];

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPlugin, setNewPlugin] = useState({
    name: "",
    type: "webhook" as const,
    webhookUrl: "",
    events: [] as string[],
  });

  useEffect(() => {
    fetchPlugins();
  }, []);

  async function fetchPlugins() {
    try {
      const res = await fetch("/api/plugins");
      if (res.ok) {
        const data = await res.json();
        setPlugins(data.plugins || []);
      }
    } catch (err) {
      console.error("Failed to fetch plugins:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createPlugin() {
    try {
      const res = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlugin.name,
          type: newPlugin.type,
          events: newPlugin.events,
          config: { webhookUrl: newPlugin.webhookUrl },
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setNewPlugin({ name: "", type: "webhook", webhookUrl: "", events: [] });
        fetchPlugins();
      }
    } catch (err) {
      console.error("Failed to create plugin:", err);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading plugins...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">Integrations & Plugins</h3>
          <p className="text-sm text-muted-foreground">Connect Mythos to your workflows</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          + Add Plugin
        </button>
      </div>

      {/* New Plugin Form */}
      {showForm && (
        <div className="border rounded-xl p-6 bg-muted/30 space-y-4">
          <h4 className="font-semibold text-sm">New Webhook Plugin</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Name</label>
              <input
                type="text"
                value={newPlugin.name}
                onChange={(e) => setNewPlugin({ ...newPlugin, name: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="e.g., Slack Notifications"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Webhook URL</label>
              <input
                type="url"
                value={newPlugin.webhookUrl}
                onChange={(e) => setNewPlugin({ ...newPlugin, webhookUrl: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="https://hooks.slack.com/..."
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((evt) => (
                <label key={evt.value} className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={newPlugin.events.includes(evt.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewPlugin({ ...newPlugin, events: [...newPlugin.events, evt.value] });
                      } else {
                        setNewPlugin({ ...newPlugin, events: newPlugin.events.filter((v) => v !== evt.value) });
                      }
                    }}
                  />
                  {evt.label}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createPlugin}
              disabled={!newPlugin.name || !newPlugin.webhookUrl}
              className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
            >
              Create Plugin
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm font-medium px-4 py-2 border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Plugins List */}
      {plugins.length === 0 ? (
        <div className="border rounded-xl p-8 text-center text-muted-foreground">
          <p className="text-sm">No plugins configured yet.</p>
          <p className="text-xs mt-1">Add a webhook to connect Mythos to Slack, Zapier, or your own systems.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="border rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${plugin.enabled ? "bg-green-100" : "bg-gray-100"}`}>
                {plugin.type === "webhook" ? "🔗" : "⚡"}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{plugin.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {plugin.type} · {plugin.events?.length || 0} events
                </p>
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded ${plugin.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {plugin.enabled ? "Active" : "Disabled"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
