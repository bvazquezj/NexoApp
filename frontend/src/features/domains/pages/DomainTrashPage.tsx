import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/AppLayout'
import { getDomainTrash, restoreDomain } from '../../../api/domains.api'

export function DomainTrashPage() {
  const queryClient = useQueryClient()
  const { data: domains, isLoading } = useQuery({ queryKey: ['domains', 'trash'], queryFn: getDomainTrash })
  const restoreMutation = useMutation({
    mutationFn: (id: string) => restoreDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] })
      queryClient.invalidateQueries({ queryKey: ['domains', 'trash'] })
    },
  })

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Papelera — Dominios</h1>
        {isLoading && <div className="text-sm text-gray-500">Cargando…</div>}
        {domains && domains.length === 0 && <div className="text-center py-20 text-gray-400">Papelera vacía</div>}
        <div className="space-y-2">
          {domains?.map(d => (
            <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-4 flex justify-between items-center">
              <span className="font-mono text-gray-500 line-through">{d.fullDomain}</span>
              <button onClick={() => restoreMutation.mutate(d.id)}
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
