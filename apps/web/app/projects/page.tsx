import ProjectsClient from "./ProjectsClient";
import { getBaseUrl } from "@/lib/baseUrl";

type Project = { id: string; name: string; status: string; createdAt?: string | null; };

async function fetchProjects(): Promise<{ projects: Project[]; error?: string | null; }> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/projects`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load projects (${res.status})`);
    const projects = await res.json();
    return { projects };
  } catch (err: any) {
    return { projects: [], error: err?.message || "Failed to load projects" };
  }
}

export default async function ProjectsPage() {
  const { projects, error } = await fetchProjects();

  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-neutral-500 uppercase">Work</p>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-sm text-neutral-600">Create a project, then drill into tasks to run the work.</p>
      </div>

      <ProjectsClient initialProjects={projects} initialError={error} />
    </main>
  );
}
