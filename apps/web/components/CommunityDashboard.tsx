"use client";

import { useEffect, useState } from "react";
import { getTierStyle, MemberTier } from "@mythos/ai-engine";

interface CommunityMember {
  id: string;
  platformHandle: string;
  platform: string;
  displayName?: string;
  avatarUrl?: string;
  superfanScore: number;
  tier: MemberTier;
  totalEngagements: number;
  lastEngagedAt?: string;
  tags?: string[];
}

interface CommunityStats {
  total: number;
  superfans: number;
  ambassadors: number;
  engaged: number;
}

export function CommunityDashboard() {
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [stats, setStats] = useState<CommunityStats>({ total: 0, superfans: 0, ambassadors: 0, engaged: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const res = await fetch("/api/community");
        if (res.ok) {
          const data = await res.json();
          setMembers(data.members || []);
          setStats(data.stats || { total: 0, superfans: 0, ambassadors: 0, engaged: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch community:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunity();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading community...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={stats.total} emoji="👥" />
        <StatCard label="Engaged" value={stats.engaged} emoji="💙" color="text-blue-600" />
        <StatCard label="Superfans" value={stats.superfans} emoji="⭐" color="text-pink-600" />
        <StatCard label="Ambassadors" value={stats.ambassadors} emoji="👑" color="text-purple-600" />
      </div>

      {/* Members List */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-3 border-b">
          <h3 className="font-bold text-sm">Community Members</h3>
        </div>
        {members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No community members yet. As people engage with your content, they'll appear here.
          </div>
        ) : (
          <div className="divide-y">
            {members.map((member) => (
              <MemberRow key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, emoji, color = "text-foreground" }: { label: string; value: number; emoji: string; color?: string }) {
  return (
    <div className="border rounded-xl p-4 bg-card">
      <div className="flex items-center gap-2 mb-1">
        <span>{emoji}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function MemberRow({ member }: { member: CommunityMember }) {
  const tierStyle = getTierStyle(member.tier);

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-sm font-bold">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          member.platformHandle.charAt(0).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {member.displayName || `@${member.platformHandle}`}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tierStyle.color}`}>
            {tierStyle.emoji} {tierStyle.label}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          @{member.platformHandle} · {member.platform} · {member.totalEngagements} engagements
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="text-lg font-bold">{member.superfanScore}</div>
        <div className="text-[10px] text-muted-foreground uppercase">Score</div>
      </div>
    </div>
  );
}
