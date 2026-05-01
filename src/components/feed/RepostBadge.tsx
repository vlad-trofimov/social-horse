type RepostBadgeProps = {
  reposterName: string
}

export default function RepostBadge({ reposterName }: RepostBadgeProps) {
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
      <span>↻</span>
      <span>{reposterName} reposted</span>
    </div>
  )
}
