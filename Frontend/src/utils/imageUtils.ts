const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect fill='%23121A2E' width='120' height='120'/%3E%3Ctext x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' fill='%235C6270' font-family='monospace' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80";

export const getImageUrl = (image?: string | null): string => {
  const value = image?.trim();
  if (!value) return FALLBACK_IMAGE;

  // Supabase Storage (and other remote/CDN) URLs are already absolute.
  if (/^(https?:)?\/\//i.test(value)) return value;
  // Data/blob URLs must be used as-is.
  if (/^(data|blob):/i.test(value)) return value;

  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
};

export const onImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = PLACEHOLDER;
};
