"use client";

import { useState } from "react";
import { VoiceVerificationResult } from "@mythos/ai-engine";

interface VoiceAuthenticatorProps {
  content: string;
  orgId?: string;
}

export function VoiceAuthenticator({ content, orgId }: VoiceAuthenticatorProps) {
  const [result, setResult] = useState<VoiceVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!content) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, orgId: orgId || "default" }),
      });

      if (!response.ok) throw new Error("Verification failed");
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-6 bg-card shadow-sm space-y-6 max-w-md w-full">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <span>🛡️</span> Voice Authenticator
        </h3>
        <button
          onClick={handleVerify}
          disabled={loading || !content}
          className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm"
        >
          {loading ? "Analyzing..." : "Verify Authenticity"}
        </button>
      </div>

      {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">Error: {error}</div>}

      {!result && !loading && !error && (
        <p className="text-muted-foreground text-sm italic">
          Run the authenticator to check for brand alignment and &quot;AI slop.&quot;
        </p>
      )}

      {result && (
        <div className="space-y-6 slide-in">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 text-center bg-muted/30">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Authenticity</div>
              <div className={`text-2xl font-black ${result.score > 80 ? 'text-green-600' : result.score > 50 ? 'text-yellow-600' : 'text-destructive'}`}>
                {result.score}%
              </div>
            </div>
            <div className="border rounded-lg p-3 text-center bg-muted/30">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Resonance</div>
              <div className={`text-2xl font-black ${result.resonance > 80 ? 'text-green-600' : result.resonance > 50 ? 'text-yellow-600' : 'text-destructive'}`}>
                {result.resonance}%
              </div>
            </div>
          </div>

          {/* Robotic Phrases */}
          {result.roboticPhrases.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-destructive/80">
                <span>🤖</span> Generic AI Markers Found
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.roboticPhrases.map((rp, i) => (
                  <div key={i} className="group relative bg-destructive/5 border border-destructive/20 text-destructive text-xs px-2 py-1 rounded-md cursor-help" title={rp.reason}>
                    &quot;{rp.phrase}&quot;
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grit Advice */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-2 text-primary/80">
              <span>🧂</span> Human &quot;Grit&quot; Suggestions
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed bg-primary/5 border border-primary/10 p-3 rounded-lg italic">
              {result.gritAdvice}
            </p>
          </div>

          {/* Specific Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <span>✏️</span> Precision Edits
              </h4>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="text-xs border rounded-lg overflow-hidden bg-muted/10">
                    <div className="bg-destructive/5 text-destructive p-2 line-through decoration-destructive/30">
                      {s.original}
                    </div>
                    <div className="bg-green-500/5 text-green-700 p-2 border-t font-medium">
                      {s.suggested}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
