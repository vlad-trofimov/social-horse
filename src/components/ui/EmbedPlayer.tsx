type Props = { src: string }

function spotifyHeight(src: string): number {
  if (src.includes('/album/') || src.includes('/playlist/')) return 352
  return 152
}

export default function EmbedPlayer({ src }: Props) {
  const isSpotify = src.startsWith('https://open.spotify.com')

  return isSpotify ? (
    <div className="mt-3 w-full overflow-hidden rounded-xl">
      <iframe
        src={src}
        width="100%"
        height={spotifyHeight(src)}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        loading="lazy"
      />
    </div>
  ) : (
    <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl">
      <iframe
        src={src}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        loading="lazy"
      />
    </div>
  )
}
