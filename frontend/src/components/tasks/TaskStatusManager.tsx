import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTaskStatusDefinitions,
  createTaskStatusDefinition,
  updateTaskStatusDefinition,
  deleteTaskStatusDefinition,
} from '../../api/tasks.api'
import type { TaskStatusDefinition } from '../../types/task.types'

interface Props {
  onClose: () => void
}

const STATUS_COLORS = [
  '#6B7280', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6',
  '#A855F7', '#EC4899', '#78716C', '#1F2937',
]

export function TaskStatusManager({ onClose }: Props) {
  const queryClient = useQueryClient()
  const { data: statuses = [], isLoading } = useQuery({
    queryKey: ['task-status-definitions'],
    queryFn: getTaskStatusDefinitions,
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', displayName: '', color: '#6B7280' })

  const createMutation = useMutation({
    mutationFn: createTaskStatusDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-status-definitions'] })
      setForm({ name: '', displayName: '', color: '#6B7280' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form> }) =>
      updateTaskStatusDefinition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-status-definitions'] })
      setEditingId(null)
      setForm({ name: '', displayName: '', color: '#6B7280' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTaskStatusDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-status-definitions'] })
    },
  })

  function handleEdit(def: TaskStatusDefinition) {
    setEditingId(def.id)
    setForm({ name: def.name, displayName: def.displayName, color: def.color })
  }

  function handleSave() {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          name: form.name || undefined,
          displayName: form.displayName || undefined,
          color: form.color || undefined,
        },
      })
    } else {
      createMutation.mutate(form)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Gestionar Estados</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {editingId ? 'Editar estado' : 'Nuevo estado'}
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre interno (PENDING)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Nombre visible"
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1 flex-wrap">
              {STATUS_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-6 h-6 rounded-full border-2 ${form.color === c ? 'border-gray-800' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="ml-auto px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setForm({ name: '', displayName: '', color: '#6B7280' }) }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : statuses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay estados definidos.</p>
          ) : (
            statuses.map(def => (
              <div key={def.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: def.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{def.displayName}</p>
                  <p className="text-xs text-gray-400">{def.name}{def.isSystem ? ' · Sistema' : ''}</p>
                </div>
                {!def.isSystem && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(def)}
                      className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (window.confirm(`¿Eliminar "${def.displayName}"?`)) deleteMutation.mutate(def.id) }}
                      className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
