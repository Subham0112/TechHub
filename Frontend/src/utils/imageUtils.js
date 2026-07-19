export const getImageUrl = (image) => {
  const fallback = "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200&q=80"
  if (!image) return fallback
  if (image.startsWith('http')) return image
  const base = import.meta.env.VITE_API_URL
  return `${base}${image}`
}