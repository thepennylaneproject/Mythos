/**
 * Content Safety Scanner: Detect potential issues in content.
 */

export type SafetyIssue =
  | "copyright_risk"
  | "trademark_mention"
  | "profanity"
  | "sensitive_topic"
  | "competitor_mention"
  | "unverified_claim"
  | "missing_disclosure";

export interface SafetyScanResult {
  safe: boolean;
  score: number; // 0-100
  issues: Array<{
    type: SafetyIssue;
    severity: "low" | "medium" | "high";
    description: string;
    location?: string;
  }>;
  suggestions: string[];
}

const PROFANITY_PATTERNS = [
  /\b(damn|hell|crap)\b/gi, // Mild
];

const SENSITIVE_TOPICS = [
  "politics",
  "religion",
  "controversial",
  "lawsuit",
  "scandal",
];

const DISCLOSURE_PATTERNS = [
  /#ad\b/i,
  /#sponsored\b/i,
  /#partner\b/i,
  /paid partnership/i,
];

/**
 * Scan content for potential commercial safety issues.
 */
export function scanContentSafety(content: string): SafetyScanResult {
  const issues: SafetyScanResult["issues"] = [];
  let score = 100;

  // Check for profanity
  for (const pattern of PROFANITY_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: "profanity",
        severity: "low",
        description: `Mild language detected: "${matches[0]}"`,
      });
      score -= 5;
    }
  }

  // Check for sensitive topics
  for (const topic of SENSITIVE_TOPICS) {
    if (content.toLowerCase().includes(topic)) {
      issues.push({
        type: "sensitive_topic",
        severity: "medium",
        description: `Potentially sensitive topic: "${topic}"`,
      });
      score -= 10;
    }
  }

  // Check for unverified claims
  const claimPatterns = [
    /\b(proven|guaranteed|100%|always|never|best|#1|number one)\b/gi,
  ];
  for (const pattern of claimPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: "unverified_claim",
        severity: "medium",
        description: `Potential unverified claim: "${matches[0]}"`,
      });
      score -= 8;
    }
  }

  // Check for missing disclosure (if content looks promotional)
  const isPromotional = /\b(buy|shop|order|discount|sale|promo)\b/i.test(content);
  const hasDisclosure = DISCLOSURE_PATTERNS.some((p) => p.test(content));
  if (isPromotional && !hasDisclosure) {
    issues.push({
      type: "missing_disclosure",
      severity: "high",
      description: "Promotional content may require disclosure (e.g., #ad)",
    });
    score -= 15;
  }

  score = Math.max(0, score);

  const suggestions: string[] = [];
  if (issues.some((i) => i.type === "missing_disclosure")) {
    suggestions.push("Add appropriate disclosure hashtags like #ad or #sponsored.");
  }
  if (issues.some((i) => i.type === "unverified_claim")) {
    suggestions.push("Consider softening absolute claims or adding qualifiers.");
  }

  return {
    safe: issues.filter((i) => i.severity === "high").length === 0,
    score,
    issues,
    suggestions,
  };
}

/**
 * Scan an asset for commercial license compliance.
 */
export function checkAssetLicense(asset: {
  licenseType?: string;
  licenseExpiry?: Date | null;
  commercialUseAllowed?: boolean;
}): { compliant: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (asset.licenseType === "unknown") {
    warnings.push("Asset license is unknown. Verify rights before commercial use.");
  }

  if (asset.licenseExpiry && new Date(asset.licenseExpiry) < new Date()) {
    warnings.push("Asset license has expired.");
  }

  if (asset.commercialUseAllowed === false) {
    warnings.push("Asset is not licensed for commercial use.");
  }

  return {
    compliant: warnings.length === 0,
    warnings,
  };
}
