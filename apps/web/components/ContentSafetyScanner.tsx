"use client";

import { useState } from "react";
import { scanContentSafety, SafetyScanResult } from "@mythos/ai-engine";

interface ContentSafetyScannerProps {
  content: string;
}

export function ContentSafetyScanner({ content }: ContentSafetyScannerProps) {
  const [result, setResult] = useState<SafetyScanResult | null>(null);
  const [scanned, setScanned] = useState(false);

  const handleScan = () => {
    const scanResult = scanContentSafety(content);
    setResult(scanResult);
    setScanned(true);
  };

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <h4 className="font-bold text-sm">Content Safety</h4>
        </div>
        <button
          onClick={handleScan}
          className="text-xs font-medium px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          {scanned ? "Re-scan" : "Scan Content"}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-bold ${result.score >= 80 ? "text-green-600" : result.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {result.score}
            </div>
            <div>
              <div className="text-sm font-medium">
                {result.safe ? "✅ Safe for publishing" : "⚠️ Review needed"}
              </div>
              <div className="text-xs text-muted-foreground">
                {result.issues.length} issue{result.issues.length !== 1 ? "s" : ""} found
              </div>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="space-y-2">
              {result.issues.map((issue, i) => (
                <div key={i} className={`text-xs px-3 py-2 rounded border ${getSeverityColor(issue.severity)}`}>
                  <span className="font-semibold uppercase">{issue.severity}:</span> {issue.description}
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="bg-muted/50 rounded p-3">
              <h5 className="text-xs font-semibold mb-2">Suggestions</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
