// lib/utils/blog.ts
export function deriveMetaDescription(
  excerpt: string | null | undefined,
  content: string,
  maxLength = 155,
): string {
  const source = (
    excerpt?.trim() || content.replace(/[#*_`>\-\[\]()]/g, "")
  ).trim();
  if (source.length <= maxLength) return source;
  return source.slice(0, maxLength - 1).trimEnd() + "…";
}
