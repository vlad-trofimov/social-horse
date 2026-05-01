const YOUTUBE_RE =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

const SPOTIFY_RE =
  /https?:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/

const ALLOWED_ORIGINS = [
  'https://www.youtube-nocookie.com',
  'https://open.spotify.com',
]

export function detectEmbedUrl(text: string): string | null {
  const yt = text.match(YOUTUBE_RE)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`

  const sp = text.match(SPOTIFY_RE)
  if (sp) return `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`

  return null
}

export function isAllowedEmbedUrl(url: string): boolean {
  return ALLOWED_ORIGINS.some((origin) => url.startsWith(origin))
}
