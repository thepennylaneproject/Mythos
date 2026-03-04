"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@mythos/ui";
import PostEditorRow, { PostDraft } from "./PostEditorRow";
import { AgenticPlanner } from "./AgenticPlanner";
import { ResearchPanel } from "./ResearchPanel";
import { CHANNELS, Channel } from "@/lib/channels";
import { StrategicPlan, PostDraft as AiPostDraft } from "@mythos/ai-engine";

type Project = { id: string; name: string; status: string; createdAt?: string | null; };
type Campaign = { id: string; name: string };

function newPostDraft(): PostDraft {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return { id, channel: "meta", caption: "" };
}

export default function ComposerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("new");
  const [newProjectName, setNewProjectName] = useState("");

  const [campaignName, setCampaignName] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [campaignBrief, setCampaignBrief] = useState("");
  const [audience, setAudience] = useState("");
  const [brandVoice, setBrandVoice] = useState("");

  const [posts, setPosts] = useState<PostDraft[]>([newPostDraft()]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAgenticMode, setIsAgenticMode] = useState(false);
  const [isResearchMode, setIsResearchMode] = useState(false);
  const [strategicPlan, setStrategicPlan] = useState<StrategicPlan | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load projects");
        const rows = await res.json();
        setProjects(rows);
        if (rows.length && selectedProjectId === "new") {
          setSelectedProjectId(rows[0].id);
        }
      } catch (err: any) {
        setProjectsError(err?.message || "Unable to load projects");
      } finally {
        setProjectsLoading(false);
      }
    }
    loadProjects();
  }, []);

  const channelCounts = useMemo(() => {
    const counts: Record<Channel, number> = { meta: 0, linkedin: 0, x: 0, tiktok: 0 };
    posts.forEach(p => { counts[p.channel] += 1; });
    return counts;
  }, [posts]);

  function updatePost(id: string, next: PostDraft) {
    setPosts(prev => prev.map(p => (p.id === id ? next : p)));
  }

  function removePost(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  function addPost() {
    setPosts(prev => [...prev, newPostDraft()]);
  }

  async function generatePosts() {
    setGenerating(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          goal: campaignGoal,
          brief: campaignBrief,
          audience: audience.split(",").map(a => a.trim()).filter(Boolean),
          channels: CHANNELS as unknown as string[],
          brandVoice: brandVoice || undefined
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate posts");
      }
      const data = await res.json();
      if (data.posts && Array.isArray(data.posts)) {
        setPosts(data.posts.map((p: any) => ({
          ...p,
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
        })));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function ensureProject(): Promise<string> {
    if (selectedProjectId !== "new") return selectedProjectId;
    const name = newProjectName.trim();
    if (!name) throw new Error("Please name the project before saving.");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status: "planned" })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create project");
    }
    const created = await res.json();
    setProjects(prev => [created, ...prev]);
    setSelectedProjectId(created.id);
    return created.id;
  }

  async function saveCampaign() {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const trimmedName = campaignName.trim();
    if (!trimmedName) {
      setErrorMessage("Campaign name is required.");
      setSaving(false);
      return;
    }
    if (!posts.length) {
      setErrorMessage("Add at least one post.");
      setSaving(false);
      return;
    }
    if (posts.some(p => !p.caption.trim())) {
      setErrorMessage("Each post needs a caption.");
      setSaving(false);
      return;
    }

    try {
      const projectId = await ensureProject();
      const campaignRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: trimmedName,
          goal: campaignGoal.trim() || undefined,
          brief: campaignBrief.trim() || undefined,
          channels: Array.from(new Set(posts.map(p => p.channel)))
        })
      });
      if (!campaignRes.ok) {
        const err = await campaignRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create campaign");
      }
      const campaign: Campaign = await campaignRes.json();

      const postsRes = await fetch(`/api/campaigns/${campaign.id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: posts.map(p => ({
            channel: p.channel,
            caption: p.caption.trim(),
            scheduledAt: p.scheduledAt || undefined
          }))
        })
      });
      if (!postsRes.ok) {
        const err = await postsRes.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create posts");
      }

      setSuccessMessage("Campaign saved!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-neutral-500 uppercase">Composer</p>
        <h1 className="text-3xl font-bold">Campaign Composer</h1>
        <p className="text-neutral-600">Define the campaign and draft posts for each channel, then save everything in one shot.</p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setIsAgenticMode(!isAgenticMode)}
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border-2 transition-all ${isAgenticMode ? 'bg-primary text-primary-foreground border-primary' : 'text-neutral-500 border-neutral-300 hover:border-primary'}`}
          >
            {isAgenticMode ? '🤖 Agentic Mode ON' : 'Enable Agentic Mode'}
          </button>
          <button
            onClick={() => setIsResearchMode(!isResearchMode)}
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border-2 transition-all ${isResearchMode ? 'bg-blue-600 text-white border-blue-600' : 'text-neutral-500 border-neutral-300 hover:border-blue-500'}`}
          >
            {isResearchMode ? '🔍 Research Mode ON' : 'Enable Research Mode'}
          </button>
        </div>
      </div>

      {isResearchMode && (
        <ResearchPanel
          channels={CHANNELS as unknown as string[]}
          brandVoice={brandVoice}
          onPostsGenerated={(aiPosts) => {
            const newPosts: PostDraft[] = aiPosts.map((p) => ({
              id: crypto.randomUUID(),
              channel: (p.channel as Channel) || "meta",
              caption: p.caption,
            }));
            if (newPosts.length > 0) setPosts(newPosts);
          }}
        />
      )}

      {isAgenticMode && (
        <AgenticPlanner
          orgId={projects.find(p => p.id === selectedProjectId)?.id}
          onPlanGenerated={(plan) => {
            setStrategicPlan(plan);
            // Convert plan phases to post drafts
            const newPosts: PostDraft[] = [];
            plan.phases.forEach(phase => {
              phase.posts.forEach(p => {
                newPosts.push({
                  id: crypto.randomUUID(),
                  channel: p.channel as Channel,
                  caption: `[${phase.name}] ${p.angle}`, // Placeholder, will be filled by generatePhaseContent
                });
              });
            });
            if (newPosts.length > 0) setPosts(newPosts);
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Campaign details" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-neutral-600 block">Project</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 bg-white"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="new">+ New project</option>
                </select>
                {selectedProjectId === "new" ? (
                  <input
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    placeholder="New project name"
                    className="flex-1 rounded-lg border border-neutral-200 px-3 py-2"
                  />
                ) : null}
              </div>
              {projectsLoading ? <p className="text-xs text-neutral-500">Loading projects…</p> : null}
              {projectsError ? <p className="text-xs text-red-600">{projectsError}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-600 block">Campaign name</label>
              <input
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2"
                placeholder="Product launch, content sprint, etc."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-600 block">Goal (optional)</label>
              <input
                value={campaignGoal}
                onChange={e => setCampaignGoal(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2"
                placeholder="Grow waitlist, drive signups, etc."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-600 block">Brief (optional)</label>
              <textarea
                value={campaignBrief}
                onChange={e => setCampaignBrief(e.target.value)}
                className="w-full min-h-[120px] rounded-lg border border-neutral-200 px-3 py-2"
                placeholder="Context, talking points, assets to reference."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-neutral-600 block">Audience (comma separated)</label>
                <input
                  value={audience}
                  onChange={e => setAudience(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2"
                  placeholder="Founders, Marketers, Gen Z..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-neutral-600 block">Brand Voice (optional)</label>
                <input
                  value={brandVoice}
                  onChange={e => setBrandVoice(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2"
                  placeholder="Witty, Bold, Academic..."
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={generatePosts}
                disabled={generating || !campaignName}
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-600 text-white font-medium disabled:opacity-50"
              >
                {generating ? "Generating..." : "Auto-Generate Posts"}
              </button>
            </div>
          </div>
        </Card>

        <Card title="Channel mix">
          <ul className="space-y-2 text-sm">
            {CHANNELS.map(ch => (
              <li key={ch} className="flex items-center justify-between">
                <span className="capitalize">{ch}</span>
                <span className="text-neutral-600">{channelCounts[ch as Channel]} posts</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Posts</h2>
          <button type="button" onClick={addPost} className="px-4 py-2 rounded-lg border border-neutral-300 bg-white">Add post</button>
        </div>
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <PostEditorRow
              key={post.id}
              post={post}
              onChange={next => updatePost(post.id, next)}
              onRemove={() => removePost(post.id)}
              canRemove={posts.length > 1}
              orgId={projects.find(p => p.id === selectedProjectId)?.id} // Using project ID as proxy for now
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <button
          type="button"
          onClick={saveCampaign}
          disabled={saving}
          className="px-5 py-3 rounded-lg bg-black text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save campaign"}
        </button>
        {errorMessage ? <span className="text-sm text-red-600">{errorMessage}</span> : null}
        {successMessage ? <span className="text-sm text-green-700">{successMessage}</span> : null}
      </div>
    </main>
  );
}
