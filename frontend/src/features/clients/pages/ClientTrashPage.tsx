import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/AppLayout'
import { getClientTrash, restoreClient } from '../../../api/domains.api'

export function ClientTrashPage() {
  const queryClient = useQueryClient()
  const { data: clients, isLoading } = useQuery({ queryKey: ['clients', 'trash'], queryFn: getClientTrash })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', 'trash'] })
    },
  })

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Papelera — Clientes</h1>
        {isLoading && <div className="text-sm text-gray-500">Cargando…</div>}
        {clients && clients.length === 0 && (
          <div className="text-center py-20 text-gray-400">Papelera vacía</div>
        )}
        <div className="space-y-2">
          {clients?.map(c => (
            <div key={c.id} className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-500 line-through">{c.name}</p>
                {c.company && <p className="text-xs text-gray-400">{c.company}</p>}
              </div>
              <button onClick={() => restoreMutation.mutate(c.id)}
                disabled={restoreMutation.isPending}
                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg disabled:opacity-50">
                Restaurar
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
