"use client";

import { useState, useEffect } from "react";
import { ROLE_OPTIONS } from "@/lib/permissions";

interface Member {
  id: string;
  role: string;
  joinedAt: string | null;
  invitedAt: string;
  userId: string;
  userName: string | null;
  userEmail: string;
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");

  // TODO: Get orgId from context
  const orgId = "mock-org-id";

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/organizations/${orgId}/members`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setLoading(false);
    }
  }

  async function inviteMember() {
    if (!inviteEmail) return;
    await fetch(`/api/organizations/${orgId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviteEmail("");
    fetchMembers();
  }

  async function updateRole(memberId: string, role: string) {
    await fetch(`/api/organizations/${orgId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, role }),
    });
    fetchMembers();
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/organizations/${orgId}/members?memberId=${memberId}`, {
      method: "DELETE",
    });
    fetchMembers();
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Team Settings</h1>

        {/* Invite Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              {ROLE_OPTIONS.filter((r) => r.value !== "owner").map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={inviteMember}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Invite
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Team Members</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-neutral-500">Loading...</div>
          ) : members.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No team members yet</div>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{member.userName || member.userEmail}</div>
                    <div className="text-sm text-neutral-500">{member.userEmail}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={member.role}
                      onChange={(e) => updateRole(member.id, e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                      disabled={member.role === "owner"}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    {member.role !== "owner" && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
