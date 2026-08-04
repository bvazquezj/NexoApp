interface Props {
  count: number
  completed: number
}

export function SubtaskProgress({ count, completed }: Props) {
  if (count === 0) return null

  const percentage = Math.round((completed / count) * 100)

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 flex-shrink-0">
        {completed}/{count}
      </span>
    </div>
  )
}
