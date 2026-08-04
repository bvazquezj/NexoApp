import { Link } from 'react-router-dom'

type HabitTab = 'today' | 'list' | 'routines' | 'sleep'

interface HabitsSubNavProps {
  active: HabitTab
}

const items: { key: HabitTab; label: string; to: string }[] = [
  { key: 'today', label: 'Hoy', to: '/habits' },
  { key: 'list', label: 'Hábitos', to: '/habits/list' },
  { key: 'routines', label: 'Rutinas', to: '/habits/routines' },
  { key: 'sleep', label: 'Sueño', to: '/habits/sleep' },
]

export function HabitsSubNav({ active }: HabitsSubNavProps) {
  return (
    <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
      {items.map(item => (
        <Link
          key={item.key}
          to={item.to}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
            active === item.key
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
