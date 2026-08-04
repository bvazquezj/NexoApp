import { NexoMark } from '../../../components/Brand'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

function ConnectionMotif() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute -bottom-24 -right-24 h-[460px] w-[460px] text-blue-500/10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="22" cy="34" r="6" fill="currentColor" />
        <circle cx="74" cy="66" r="9" fill="currentColor" />
        <circle cx="86" cy="18" r="3.5" fill="#D9A83D" opacity="0.7" />
        <path d="M22 34 L74 66 M74 66 L86 18" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
        <path d="M22 34 L86 18" stroke="#D9A83D" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 3" />
      </svg>
      <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute right-1/4 top-10 h-40 w-40 rounded-full bg-gold-400/10 blur-3xl" />
    </div>
  )
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 lg:flex lg:flex-col lg:justify-between">
        <ConnectionMotif />

        <div className="relative z-10 flex items-center gap-3 px-10 pt-10">
          <NexoMark />
          <span className="font-display text-2xl font-bold tracking-tight text-white">Nexo</span>
        </div>

        <div className="relative z-10 max-w-md px-10 pb-16">
          <h1 className="font-display text-4xl font-semibold leading-tight text-white">
            Tu trabajo y tu vida,
            <br />
            <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
              en un solo punto.
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Tareas, finanzas, hábitos, proyectos y clientes. Todo conectado, todo en su lugar.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {['Tareas', 'Finanzas', 'Hábitos', 'Proyectos'].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="relative z-10 px-10 pb-8 text-xs text-slate-600">
          © {new Date().getFullYear()} Nexo · Centro de operaciones personal
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <NexoMark />
            <span className="font-display text-xl font-bold tracking-tight text-ink-900">Nexo</span>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">{title}</h2>
          <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
