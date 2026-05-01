type RepostBadgeProps = {
  originalAuthorName: string
}

export default function RepostBadge({ originalAuthorName }: RepostBadgeProps) {
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
      <span>↻</span>
      <span>{originalAuthorName} reposted</span>
    </div>
  )
}
