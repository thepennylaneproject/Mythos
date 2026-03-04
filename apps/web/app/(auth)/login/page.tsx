'use client';

import { Github, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const startOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    setError(null);
    await signIn(provider, { callbackUrl });
  };

  const handleEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setError(null);
    const res = await signIn("email", { email, callbackUrl, redirect: false });
    if (res?.error) {
      setError("We couldn't send the link. Double-check your email and try again.");
      setStatus("idle");
      return;
    }
    setStatus("sent");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl bg-white/90 px-8 py-10 shadow-lg ring-1 ring-black/5 backdrop-blur">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--brick-gray)]">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in to Mythos</h1>
          <p className="mt-2 text-sm text-[var(--brick-gray)]">Use OAuth or a magic link to get back to the stories.</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => startOAuth("google")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-[var(--wall-white)] px-4 py-3 text-sm font-medium hover:-translate-y-[1px] hover:shadow transition"
          >
            <Sparkles size={18} />
            {oauthLoading === "google" ? "Opening Google..." : "Continue with Google"}
          </button>
          <button
            type="button"
            onClick={() => startOAuth("github")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-[#0f1116] px-4 py-3 text-sm font-medium text-white hover:-translate-y-[1px] hover:shadow-lg transition"
          >
            <Github size={18} />
            {oauthLoading === "github" ? "Opening GitHub..." : "Continue with GitHub"}
          </button>
        </div>

        <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-[var(--brick-gray)]">
          <span className="h-px flex-1 bg-black/10" />
          Or magic link
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          <label className="block text-sm font-medium text-[var(--brick-gray)]">Work email</label>
          <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-[var(--signal-teal)]">
            <Mail size={18} className="text-[var(--brick-gray)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--brick-gray)]"
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--signal-teal)] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "sending" ? "Sending magic link..." : status === "sent" ? "Link sent—check your inbox" : "Email me a link"}
          </button>
          {error && <p className="text-sm text-[var(--scarlet-burst)]">{error}</p>}
        </form>

        <p className="mt-6 text-sm text-[var(--brick-gray)]">
          New to Mythos?{" "}
          <Link href="/signup" className="font-semibold text-[var(--signal-teal)] hover:text-[var(--ink-black)]">
            Create an account
          </Link>
        </p>
      </div>

      <div className="rounded-3xl bg-[var(--ink-black)] px-8 py-10 text-[var(--wall-white)] shadow-2xl">
        <div className="flex items-center gap-3 text-sm text-[var(--graffiti-gold)]">
          <Sparkles size={18} />
          Storyteller-in-residence
        </div>
        <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight">Plot twists meet performance.</h2>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          Author bold campaigns, orchestrate drops, and keep every creative asset in lockstep. Mythos keeps the machine
          humming while you focus on the narrative.
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">How it works</p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li>• Draft in Composer, ship to every channel.</li>
            <li>• Collaborate with campaigns, sprints, and approvals.</li>
            <li>• Learn from feedback loops powered by AI.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
