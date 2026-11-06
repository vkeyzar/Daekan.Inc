/**
 * Generates an SEO-friendly slug in the format "nama-produk-id".
 * - Converts product name to lowercase
 * - Removes special characters
 * - Replaces spaces (and consecutive hyphens) with a single hyphen (-)
 * - Appends `-${id}` at the end
 */
export function generateSlug(name: string | undefined | null, id: string | number): string {
  const cleanName = String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return cleanName ? `${cleanName}-${id}` : String(id);
}

/**
 * Extracts the product ID from a slug formatted as "nama-produk-id"
 * by taking the substring after the last hyphen (-).
 */
export function extractIdFromSlug(slug: string): string {
  if (!slug) return '';
  const decoded = decodeURIComponent(slug);
  const lastDashIndex = decoded.lastIndexOf('-');
  return lastDashIndex !== -1 ? decoded.substring(lastDashIndex + 1) : decoded;
}

