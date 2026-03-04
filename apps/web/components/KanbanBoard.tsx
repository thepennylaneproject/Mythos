"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

type Task = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  assignee?: { id: string; name: string } | null;
  dueAt?: string | Date | null;
  points?: number | null;
};

type ColumnKey = Task["status"];
const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" }
];

export default function KanbanBoard({ projectId, initialTasks = [] }: { projectId: string; initialTasks?: Task[]; }) {
  const normalizeTask = (t: Task) => ({ ...t, status: t.status === "doing" || t.status === "done" ? t.status : "todo" as const });
  const [tasks, setTasks] = useState<Task[]>(initialTasks.map(normalizeTask));
  const [dragId, setDragId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);

  useEffect(() => setTasks(initialTasks.map(normalizeTask)), [initialTasks]);
  const byCol = useMemo(() => {
    const m: Record<ColumnKey, Task[]> = { todo: [], doing: [], done: [] };
    tasks.forEach(t => m[t.status].push(t));
    return m;
  }, [tasks]);

  async function moveTask(taskId: string, next: ColumnKey) {
    const previous = tasks;
    setActionError(null);
    setSavingTaskId(taskId);
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: next } : t)));

    try {
      const res = await fetch("/api/tasks/" + taskId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to move task");
      }
      const updated = await res.json();
      setTasks(prev => prev.map(t => (t.id === taskId ? normalizeTask({ ...t, ...updated }) : t)));
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor: "me",
          verb: "moved",
          entity: "task",
          entityId: taskId,
          meta: { to: next, projectId }
        })
      });
    } catch (err: any) {
      setActionError(err?.message || "Could not update task");
      setTasks(previous);
    } finally {
      setSavingTaskId(null);
    }
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      setActionError("Please give the task a title.");
      return;
    }
    setCreating(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, status: "todo" })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create task");
      }
      const created = await res.json();
      setTasks(prev => [normalizeTask(created), ...prev]);
      setNewTitle("");
    } catch (err: any) {
      setActionError(err?.message || "Could not create task");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createTask} className="flex flex-col sm:flex-row gap-2 items-start">
        <div className="flex-1 w-full">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="New task title"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
        >
          {creating ? "Adding..." : "Add task"}
        </button>
      </form>
      {actionError ? <div className="text-sm text-red-600">{actionError}</div> : null}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(col => (
          <div key={col.key}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const tid = e.dataTransfer.getData("text/plain"); if (tid) moveTask(tid, col.key); }}
            className="rounded-xl bg-white/70 backdrop-blur p-3 border border-neutral-200 min-h-[40vh]"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{col.label}</h3>
              <span className="text-xs text-neutral-500">{byCol[col.key].length}</span>
            </div>
            <div className="space-y-2">
              {byCol[col.key].map(t => {
                const isSaving = savingTaskId === t.id;
                return (
                  <article key={t.id}
                    draggable
                    onDragStart={e => { setDragId(t.id); e.dataTransfer.setData("text/plain", t.id); }}
                    onDragEnd={() => setDragId(null)}
                    className={`rounded-lg border p-3 bg-white shadow-sm cursor-grab active:cursor-grabbing ${dragId === t.id ? "opacity-70" : ""} ${isSaving ? "opacity-60" : ""}`}
                  >
                    <h4 className="font-medium">{t.title}</h4>
                    <div className="mt-1 text-xs text-neutral-500 flex flex-wrap gap-2">
                      {t.assignee?.name ? <span>• {t.assignee.name}</span> : null}
                      {t.dueAt ? <span>• due {format(new Date(t.dueAt), "MMM d")}</span> : null}
                      {typeof t.points === "number" ? <span>• {t.points} pts</span> : null}
                      {isSaving ? <span className="text-neutral-400">saving...</span> : null}
                    </div>
                  </article>
                );
              })}
              {byCol[col.key].length === 0 ? (
                <p className="text-sm text-neutral-400">No tasks yet.</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
