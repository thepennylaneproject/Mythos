/**
 * PublishingAgent: Self-healing logic for failed publications.
 */

export type FailureType = 
  | "rate_limit"
  | "auth_expired"
  | "network_error"
  | "content_policy"
  | "unknown";

export interface Diagnosis {
  failureType: FailureType;
  retryable: boolean;
  suggestedWaitMs: number;
  recommendation: string;
}

export interface HealingAction {
  type: "retry" | "modify_content" | "switch_channel" | "alert_user";
  description: string;
}

const MAX_RETRIES = 5;

export class PublishingAgent {
  /**
   * Diagnose a publishing failure based on error details.
   */
  diagnose(errorCode: string | null, errorMessage: string | null): Diagnosis {
    const msg = (errorMessage || "").toLowerCase();
    const code = (errorCode || "").toLowerCase();

    // Rate limit detection
    if (code.includes("429") || msg.includes("rate limit") || msg.includes("too many requests")) {
      return {
        failureType: "rate_limit",
        retryable: true,
        suggestedWaitMs: 60000, // 1 minute
        recommendation: "Wait and retry. Platform rate limit reached.",
      };
    }

    // Auth issues
    if (code.includes("401") || code.includes("403") || msg.includes("unauthorized") || msg.includes("token expired")) {
      return {
        failureType: "auth_expired",
        retryable: false,
        suggestedWaitMs: 0,
        recommendation: "Re-authenticate with the platform. Token may have expired.",
      };
    }

    // Network errors
    if (msg.includes("timeout") || msg.includes("econnrefused") || msg.includes("network")) {
      return {
        failureType: "network_error",
        retryable: true,
        suggestedWaitMs: 30000, // 30 seconds
        recommendation: "Network issue detected. Will retry shortly.",
      };
    }

    // Content policy
    if (msg.includes("policy") || msg.includes("violation") || msg.includes("community guidelines")) {
      return {
        failureType: "content_policy",
        retryable: false,
        suggestedWaitMs: 0,
        recommendation: "Content may violate platform policies. Review and modify before retrying.",
      };
    }

    // Unknown
    return {
      failureType: "unknown",
      retryable: true,
      suggestedWaitMs: 120000, // 2 minutes
      recommendation: "Unknown failure. Will attempt retry with increased delay.",
    };
  }

  /**
   * Determine if we should retry based on count and diagnosis.
   */
  shouldRetry(retryCount: number, diagnosis: Diagnosis): boolean {
    if (!diagnosis.retryable) return false;
    if (retryCount >= MAX_RETRIES) return false;
    return true;
  }

  /**
   * Calculate exponential backoff delay.
   */
  getBackoffDelay(retryCount: number, baseMs: number = 5000): number {
    return Math.min(baseMs * Math.pow(2, retryCount), 300000); // Max 5 minutes
  }

  /**
   * Prescribe a healing action based on diagnosis.
   */
  prescribeFix(diagnosis: Diagnosis): HealingAction {
    switch (diagnosis.failureType) {
      case "rate_limit":
        return { type: "retry", description: "Waiting for rate limit to reset, then retrying." };
      case "auth_expired":
        return { type: "alert_user", description: "Platform authentication expired. User must re-connect." };
      case "network_error":
        return { type: "retry", description: "Retrying after network stabilization." };
      case "content_policy":
        return { type: "modify_content", description: "Content may need review. Alerting user for manual intervention." };
      default:
        return { type: "retry", description: "Attempting automatic recovery." };
    }
  }
}
