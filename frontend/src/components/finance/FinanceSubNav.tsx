import { Link } from 'react-router-dom'

type FinanceTab = 'summary' | 'transactions' | 'budgets' | 'subscriptions' | 'categories' | 'charts' | 'trash'

interface FinanceSubNavProps {
  active: FinanceTab
}

const items: { key: FinanceTab; label: string; to: string }[] = [
  { key: 'summary', label: 'Resumen', to: '/finance' },
  { key: 'transactions', label: 'Transacciones', to: '/finance/transactions' },
  { key: 'budgets', label: 'Presupuestos', to: '/finance/budgets' },
  { key: 'subscriptions', label: 'Suscripciones', to: '/finance/subscriptions' },
  { key: 'categories', label: 'Categorías', to: '/finance/categories' },
  { key: 'charts', label: 'Gráficas', to: '/finance/charts' },
  { key: 'trash', label: 'Papelera', to: '/finance/transactions/trash' },
]

export function FinanceSubNav({ active }: FinanceSubNavProps) {
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
