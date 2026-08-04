import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/AppLayout'
import { FinanceSubNav } from '../../../components/finance/FinanceSubNav'
import { getTransactionTrash, restoreTransaction } from '../../../api/finance.api'
import { formatAmount, formatDate } from '../../../utils/finance'

export function TransactionTrashPage() {
  const queryClient = useQueryClient()

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['finance', 'transactions', 'trash'],
    queryFn: getTransactionTrash,
  })

  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] })
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] })
    },
  })

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <header className="flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Papelera</h1>
          </div>
          <FinanceSubNav active="trash" />
        </header>

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            Error al cargar la papelera.
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && items?.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-sm font-medium">No hay transacciones eliminadas</p>
            <p className="text-xs mt-1">Las transacciones eliminadas apareceran aqui</p>
          </div>
        )}

        {!isLoading && items && items.length > 0 && (
          <div className="space-y-3">
            {items.map(tx => (
              <div
                key={tx.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Type indicator */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg
                      className={`w-4 h-4 ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {tx.type === 'INCOME'
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      }
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500 line-through truncate">
                      {tx.description ?? 'Sin descripcion'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tx.category.color }}
                      />
                      <span className="text-xs text-gray-400">{tx.category.name}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatAmount(tx.amount, tx.currency)}
                  </span>

                  <button
                    onClick={() => restoreMutation.mutate(tx.id)}
                    disabled={restoreMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Restaurar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
