import KanbanBoard from "@/components/KanbanBoard";
import GanttTimeline from "@/components/GanttTimeline";
import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/baseUrl";

type ProjectResponse = {
  id: string;
  name: string;
  status: string;
  startAt?: string | null;
  endAt?: string | null;
  sprints?: { id: string; name: string; startAt: string; endAt: string }[];
  tasks?: { id: string; title: string; status: "todo" | "doing" | "done"; startAt?: string | null; dueAt?: string | null; }[];
};

async function getProject(id: string): Promise<ProjectResponse | null> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/projects/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load project (${res.status})`);
  }
  return res.json();
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  if (!project) notFound();

  const startFallback = project.startAt ?? project.tasks?.[0]?.dueAt ?? new Date().toISOString();
  const endFallback = project.endAt ?? project.tasks?.[0]?.dueAt ?? startFallback;

  const bars = [
    ...(project.sprints ?? []).map(s => ({
      id: s.id, label: s.name, startAt: s.startAt, endAt: s.endAt, lane: "Sprints", color: "linear-gradient(90deg,#C7A76A,#595959)"
    })),
    ...(project.tasks ?? []).map(t => ({
      id: t.id, label: t.title, startAt: t.startAt ?? project.startAt ?? startFallback, endAt: t.dueAt ?? project.endAt ?? endFallback, lane: "Tasks"
    }))
  ];

  return (
    <main className="p-6 space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-neutral-500 uppercase">Project</p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <span className="px-2 py-1 rounded-full border text-xs bg-white/70">{project.status}</span>
        </div>
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Timeline</h2>
        <GanttTimeline start={project.startAt ?? startFallback} end={project.endAt ?? endFallback} bars={bars} />
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Workboard</h2>
        <KanbanBoard projectId={project.id} initialTasks={project.tasks} />
      </section>
    </main>
  );
}
