import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { NotificationsBell } from '../notifications/NotificationsBell'
import { NexoMark } from '../Brand'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

function iconProps(size = 'w-[18px] h-[18px]') {
  return {
    className: `${size} flex-shrink-0`,
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
  } as const
}

const LayoutIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const ChecklistIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const CurrencyIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SparkIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const FolderIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
)

const CloudIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
)

const BriefcaseIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const GlobeIcon = () => (
  <svg {...iconProps()} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}>
    <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const LogoutIcon = () => (
  <svg {...iconProps('w-4 h-4')} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: <LayoutIcon /> }],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Tareas', to: '/tasks', icon: <ChecklistIcon /> },
      { label: 'Finanzas', to: '/finance', icon: <CurrencyIcon /> },
      { label: 'Proyectos', to: '/projects', icon: <FolderIcon /> },
      { label: 'Deployments', to: '/deployments', icon: <CloudIcon /> },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { label: 'Clientes', to: '/clients', icon: <BriefcaseIcon /> },
      { label: 'Dominios', to: '/domains', icon: <GlobeIcon /> },
    ],
  },
  {
    title: 'Bienestar',
    items: [{ label: 'Hábitos', to: '/habits', icon: <SparkIcon /> }],
  },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <NexoMark />
        <div className="leading-none">
          <span className="font-display text-xl font-bold tracking-tight text-white">Nexo</span>
          <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Centro de operaciones
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navSections.map((section) => (
          <div key={section.title} className="mt-4">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/40'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-gold-300 to-gold-500" />
                      )}
                      <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}>{item.icon}</span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="relative flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-semibold text-white ring-2 ring-gold-400/60 ring-offset-2 ring-offset-ink-900">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-ink-900" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name ?? 'Usuario'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? ''}</p>
          </div>
          <NotificationsBell />
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-white/5 hover:text-red-400"
        >
          <LogoutIcon />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
