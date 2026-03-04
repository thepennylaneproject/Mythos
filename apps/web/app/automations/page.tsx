"use client";

import { useState, useEffect } from "react";

interface Automation {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchAutomations();
  }, []);

  async function fetchAutomations() {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      setAutomations(data.automations || []);
    } catch (error) {
      console.error("Failed to fetch automations:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/automations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchAutomations();
  }

  async function runAutomation(id: string) {
    const res = await fetch(`/api/automations/${id}`, { method: "POST" });
    const result = await res.json();
    alert(`Automation ${result.status}: ${result.output ? JSON.stringify(result.output) : result.error || ""}`);
  }

  async function deleteAutomation(id: string) {
    if (!confirm("Delete this automation?")) return;
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    fetchAutomations();
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Automations</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Automation
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500">Loading...</div>
        ) : automations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
            <p className="text-neutral-500 mb-4">Create your first automation to streamline your workflow.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Create Automation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleActive(auto.id, auto.isActive)}
                    className={`w-12 h-6 rounded-full transition ${
                      auto.isActive ? "bg-green-500" : "bg-neutral-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition transform ${
                        auto.isActive ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{auto.name}</h3>
                    <p className="text-sm text-neutral-500">{auto.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => runAutomation(auto.id)}
                    className="px-3 py-1 text-sm bg-neutral-100 rounded hover:bg-neutral-200"
                  >
                    ▶ Run
                  </button>
                  <button
                    onClick={() => deleteAutomation(auto.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal Placeholder */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Automation</h2>
              <p className="text-neutral-500 mb-4">Visual flow builder coming soon...</p>
              <button
                onClick={() => setShowCreate(false)}
                className="w-full py-2 bg-neutral-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
