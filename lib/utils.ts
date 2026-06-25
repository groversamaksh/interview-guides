/**
 * Format a slug/filename segment into a human-readable label.
 * Strips numeric prefixes (e.g. "01_"), replaces underscores/hyphens with spaces.
 */
export function formatLabel(name: string): string {
  return name
    .replace(/^\d+[_\-]\s*/, "")
    .replace(/[_\-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
