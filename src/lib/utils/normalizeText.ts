export function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')           // normalize line endings
    .replace(/[ \t]{2,}/g, ' ')       // collapse multiple spaces/tabs
    .replace(/\n{3,}/g, '\n\n')       // collapse excessive blank lines
    .trim()
}
