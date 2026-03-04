import { useState } from "react";
import { CHANNELS, Channel } from "@/lib/channels";
import { VoiceAuthenticator } from "@/components/VoiceAuthenticator";
import { DeeplinkPanel } from "@/components/DeeplinkPanel";
import { SupportedPlatform } from "@mythos/ai-engine";

export type PostDraft = {
  id: string;
  channel: Channel;
  caption: string;
  scheduledAt?: string;
};

export default function PostEditorRow({
  post,
  onChange,
  onRemove,
  canRemove,
  orgId,
}: {
  post: PostDraft;
  onChange: (next: PostDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
  orgId?: string;
}) {
  const [showAuthenticator, setShowAuthenticator] = useState(false);
  const [showDeeplink, setShowDeeplink] = useState(false);

  // Map channel to supported platform
  const platformMap: Record<Channel, SupportedPlatform> = {
    meta: "instagram",
    linkedin: "linkedin",
    x: "x",
    tiktok: "tiktok",
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-xs text-neutral-600 block mb-1">Channel</label>
          <select
            value={post.channel}
            onChange={e => onChange({ ...post, channel: e.target.value as Channel })}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 bg-white"
          >
            {CHANNELS.map(ch => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs text-neutral-600 block mb-1">Scheduled at (optional)</label>
          <input
            type="datetime-local"
            value={post.scheduledAt ?? ""}
            onChange={e => onChange({ ...post, scheduledAt: e.target.value })}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2"
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs text-neutral-600 block">Caption</label>
          <button 
            type="button" 
            onClick={() => setShowAuthenticator(!showAuthenticator)}
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${showAuthenticator ? 'bg-black text-white border-black' : 'text-neutral-500 border-neutral-200 hover:border-neutral-400'}`}
          >
            {showAuthenticator ? "Close Authenticator" : "Verify Authenticity"}
          </button>
        </div>
        <textarea
          value={post.caption}
          onChange={e => onChange({ ...post, caption: e.target.value })}
          className="w-full min-h-[120px] rounded-lg border border-neutral-200 px-3 py-2"
          placeholder="What do you want to say?"
        />
      </div>

      {showAuthenticator && (
        <div className="mt-4 flex justify-center">
          <VoiceAuthenticator content={post.caption} orgId={orgId} />
        </div>
      )}

      {/* Deeplink Publishing */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowDeeplink(!showDeeplink)}
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${showDeeplink ? 'bg-blue-600 text-white border-blue-600' : 'text-neutral-500 border-neutral-200 hover:border-blue-400'}`}
        >
          {showDeeplink ? "Hide Deeplink" : "🔗 Quick Publish"}
        </button>
      </div>

      {showDeeplink && (
        <DeeplinkPanel
          platform={platformMap[post.channel]}
          caption={post.caption}
        />
      )}

      {canRemove ? (
        <div className="text-right">
          <button type="button" className="text-sm text-red-600 underline" onClick={onRemove}>Remove</button>
        </div>
      ) : null}
    </div>
  );
}
