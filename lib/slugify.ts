/**
 * Converts arbitrary human text (such as a call title) into a clean,
 * browser-safe URL slug containing only lowercase letters, numbers, and hyphens.
 */
export function toUrlSlug(input: string, maxLength = 120): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/**
 * Gently sanitizes a slug while the user is actively typing in the slug field:
 * converts spaces to hyphens, strips URL-unsafe characters, and collapses
 * repeated hyphens while preserving a single trailing hyphen mid-entry.
 */
export function sanitizeSlugInput(input: string, maxLength = 120): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, maxLength);
}
