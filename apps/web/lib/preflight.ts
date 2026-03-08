/**
 * Pre-publish preflight checks.
 *
 * TODO: Implement real validation — check caption length per platform,
 * verify media attachments are present when required, validate scheduled
 * time is in the future, and confirm the org has a valid OAuth token for
 * the target channel. Frontend is ready to display errors[].
 */
export function preflightCheckPost(_: any) {
  // Stub: always passes. Real validation is pending platform-specific rules.
  return { ok: true, errors: [] as string[] };
}
