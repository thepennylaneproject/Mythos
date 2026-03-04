"use client";

import { useState, useEffect } from "react";
import { generateDeeplink, isMobileDevice, SupportedPlatform } from "@mythos/ai-engine";

interface DeeplinkPanelProps {
  platform: SupportedPlatform;
  caption?: string;
  mediaUrl?: string;
  hashtags?: string[];
  url?: string;
}

export function DeeplinkPanel({ platform, caption, mediaUrl, hashtags, url }: DeeplinkPanelProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  const result = generateDeeplink({ platform, caption, mediaUrl, hashtags, url });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(caption || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    // Try deeplink first, fall back to web URL
    const link = isMobile ? result.deeplink : result.fallbackUrl;
    if (link) {
      window.open(link, "_blank");
    }
  };

  const platformColors: Record<SupportedPlatform, string> = {
    instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
    tiktok: "bg-black",
    linkedin: "bg-blue-700",
    x: "bg-black",
    facebook: "bg-blue-600",
    threads: "bg-black",
  };

  const platformIcons: Record<SupportedPlatform, string> = {
    instagram: "📸",
    tiktok: "🎵",
    linkedin: "💼",
    x: "𝕏",
    facebook: "📘",
    threads: "🧵",
  };

  return (
    <div className="border rounded-xl p-4 bg-card space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${platformColors[platform]} flex items-center justify-center text-white text-lg`}>
          {platformIcons[platform]}
        </div>
        <div>
          <h4 className="font-bold text-sm capitalize">{platform}</h4>
          <p className="text-xs text-muted-foreground">Native App Publishing</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground italic">{result.instructions}</p>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 text-xs font-medium px-3 py-2 rounded-lg border hover:bg-muted transition-colors"
        >
          {copied ? "✓ Copied!" : "📋 Copy Caption"}
        </button>
        <button
          onClick={handleOpenApp}
          className={`flex-1 text-xs font-medium px-3 py-2 rounded-lg text-white transition-colors ${platformColors[platform]} hover:opacity-90`}
        >
          {isMobile ? "🚀 Open in App" : "🌐 Open Web"}
        </button>
      </div>

      {!isMobile && (
        <div className="text-[10px] text-center text-muted-foreground">
          Scan QR code from mobile for native app experience
        </div>
      )}
    </div>
  );
}
