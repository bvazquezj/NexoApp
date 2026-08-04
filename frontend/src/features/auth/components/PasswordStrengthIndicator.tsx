interface PasswordStrengthIndicatorProps {
  password: string
}

function getStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthConfig = [
  { label: 'Muy débil', barColor: 'bg-red-500' },
  { label: 'Débil', barColor: 'bg-orange-400' },
  { label: 'Media', barColor: 'bg-yellow-400' },
  { label: 'Fuerte', barColor: 'bg-green-500' },
]

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const strength = getStrength(password)
  const config = strengthConfig[strength - 1] ?? strengthConfig[0]

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
              level <= strength ? config.barColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{config.label}</p>
    </div>
  )
}
