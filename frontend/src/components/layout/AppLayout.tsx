import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
