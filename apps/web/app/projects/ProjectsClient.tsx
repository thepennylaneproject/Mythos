"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { PROJECT_STATUSES } from "@/lib/pm";

type Project = {
  id: string;
  name: string;
  status: string;
  createdAt?: string | null;
};

export default function ProjectsClient({ initialProjects, initialError }: { initialProjects: Project[]; initialError?: string | null; }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(PROJECT_STATUSES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => setProjects(initialProjects), [initialProjects]);

  async function createProject(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Project name is required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, status })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create project");
      }
      const created = await res.json();
      setProjects(prev => [created, ...prev]);
      setName("");
    } catch (err: any) {
      setError(err?.message || "Could not create project");
    } finally {
      setSubmitting(false);
    }
  }

  async function refreshList() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load projects");
      const next = await res.json();
      setProjects(next);
    } catch (err: any) {
      setError(err?.message || "Could not refresh projects");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createProject} className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white/70 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="New project name"
            className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value as typeof PROJECT_STATUSES[number])}
            className="rounded-lg border border-neutral-200 px-3 py-2 bg-white"
          >
            {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create project"}
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <button onClick={refreshList} className="text-sm text-neutral-600 underline disabled:opacity-60" disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(proj => (
          <div key={proj.id} className="rounded-xl border border-neutral-200 bg-white/70 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{proj.name}</h3>
              <span className="text-xs px-2 py-1 rounded-full border bg-white">{proj.status}</span>
            </div>
            <p className="text-xs text-neutral-500">
              Created {proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : "—"}
            </p>
            <Link href={`/projects/${proj.id}`} className="text-sm text-black underline">Open board</Link>
          </div>
        ))}
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">
            No projects yet. Create one to get started.
          </div>
        ) : null}
      </div>
    </div>
  );
}
