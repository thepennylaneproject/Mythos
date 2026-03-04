import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/baseUrl";
import { PostStatus } from "@/lib/postStatus";
import { PostStatusBadge } from "@/components/PostStatusBadge";

type Campaign = {
  id: string;
  name: string;
  goal?: string | null;
  brief?: string | null;
  channels?: string[] | null;
  createdAt?: string | null;
};

type CampaignPost = {
  id: string;
  channel: string;
  caption: string;
  status: PostStatus;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
};

async function getCampaign(id: string): Promise<Campaign | null> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/campaigns/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load campaign (${res.status})`);
  }
  return res.json();
}

async function getCampaignPosts(id: string): Promise<CampaignPost[]> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/campaigns/${id}/posts`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load posts (${res.status})`);
  }
  return res.json();
}

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id);
  if (!campaign) notFound();

  let posts: CampaignPost[] = [];
  let postsError: string | null = null;
  try {
    posts = await getCampaignPosts(params.id);
  } catch (err: any) {
    postsError = err?.message || "Unable to load posts";
  }

  return (
    <main className="p-6 space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-neutral-500 uppercase">Campaign</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            {campaign.goal ? <p className="text-neutral-600">Goal: {campaign.goal}</p> : null}
          </div>
          {campaign.channels?.length ? (
            <div className="flex flex-wrap gap-2 text-sm text-neutral-700">
              {campaign.channels.map(ch => (
                <span key={ch} className="px-3 py-1 rounded-full border border-neutral-200 bg-white/70">
                  {ch}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {campaign.brief ? <p className="text-neutral-700 max-w-3xl">{campaign.brief}</p> : null}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Posts</h2>
            <p className="text-sm text-neutral-600">Draft, scheduled, ready, and published posts for this campaign.</p>
          </div>
          {postsError ? <span className="text-sm text-red-700">{postsError}</span> : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white/70">
          <div className="grid grid-cols-[2fr,1fr,1fr] text-sm font-medium text-neutral-700 bg-neutral-50 px-4 py-2">
            <div>Caption</div>
            <div>Channel</div>
            <div>Status</div>
          </div>
          {posts.length === 0 ? (
            <div className="px-4 py-6 text-sm text-neutral-600">No posts yet for this campaign.</div>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {posts.map(post => (
                <li key={post.id} className="grid grid-cols-[2fr,1fr,1fr] items-center px-4 py-3 gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-neutral-900">{post.caption || "Untitled post"}</p>
                    <div className="text-xs text-neutral-500">
                      {post.scheduledAt ? `Scheduled for ${new Date(post.scheduledAt).toLocaleString()}` : "Not scheduled"}
                    </div>
                  </div>
                  <div className="text-sm capitalize text-neutral-800">{post.channel}</div>
                  <div className="text-sm">
                    <PostStatusBadge status={post.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
