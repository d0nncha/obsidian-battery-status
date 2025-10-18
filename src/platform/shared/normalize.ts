export function normalizeId(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9:]/g, '')
    .trim();
}
