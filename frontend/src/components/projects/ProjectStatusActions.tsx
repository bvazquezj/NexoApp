import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { changeProjectStatus } from '../../api/projects.api'
import type { ProjectStatus } from '../../types/project.types'

interface Props {
  projectId: string
  status: ProjectStatus
}

interface Transition {
  label: string
  target: ProjectStatus
  className: string
}

const TRANSITIONS: Record<ProjectStatus, Transition[]> = {
  ACTIVE: [
    { label: 'Iniciar ejecución', target: 'IN_PROGRESS', className: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { label: 'Pausar', target: 'PAUSED', className: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
    { label: 'Cancelar', target: 'CANCELLED', className: 'bg-red-100 hover:bg-red-200 text-red-700' },
  ],
  IN_PROGRESS: [
    { label: 'Volver a Activo', target: 'ACTIVE', className: 'bg-green-100 hover:bg-green-200 text-green-700' },
    { label: 'Pausar', target: 'PAUSED', className: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' },
    { label: 'Completar', target: 'COMPLETED', className: 'bg-gray-700 hover:bg-gray-800 text-white' },
    { label: 'Cancelar', target: 'CANCELLED', className: 'bg-red-100 hover:bg-red-200 text-red-700' },
  ],
  PAUSED: [
    { label: 'Reanudar', target: 'ACTIVE', className: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Iniciar ejecución', target: 'IN_PROGRESS', className: 'bg-blue-600 hover:bg-blue-700 text-white' },
  ],
  COMPLETED: [
    { label: 'Archivar', target: 'ARCHIVED', className: 'bg-gray-200 hover:bg-gray-300 text-gray-700' },
    { label: 'Reactivar', target: 'ACTIVE', className: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
  CANCELLED: [
    { label: 'Archivar', target: 'ARCHIVED', className: 'bg-gray-200 hover:bg-gray-300 text-gray-700' },
    { label: 'Reactivar', target: 'ACTIVE', className: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
  ARCHIVED: [
    { label: 'Restaurar a desarrollo', target: 'ACTIVE', className: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
}

export function ProjectStatusActions({ projectId, status }: Props) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (target: ProjectStatus) => changeProjectStatus(projectId, { status: target }),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        const code = err.response?.data?.code
        if (code === 'INVALID_PROJECT_TRANSITION') {
          setError('Esta transición de estado no es válida.')
          return
        }
      }
      setError('Error al cambiar el estado. Intenta de nuevo.')
    },
  })

  const transitions = TRANSITIONS[status] ?? []

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {transitions.map(t => (
          <button
            key={t.target}
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(t.target)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${t.className}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}
