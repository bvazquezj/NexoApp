import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  getProjectTechs,
  addProjectTech,
  removeProjectTech,
  searchTechCatalog,
} from '../../../api/projects.api'
import type {
  ProjectTechResponse,
  TechCategory,
  TechCatalogResponse,
} from '../../../types/project.types'

interface Props {
  projectId: string
}

const CATEGORIES: TechCategory[] = ['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'MOBILE', 'OTHER']

const CATEGORY_LABELS: Record<TechCategory, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Base de Datos',
  DEVOPS: 'DevOps',
  MOBILE: 'Mobile',
  OTHER: 'Otros',
}

const CATEGORY_COLORS: Record<TechCategory, string> = {
  FRONTEND: 'bg-blue-50 text-blue-700 border-blue-200',
  BACKEND: 'bg-purple-50 text-purple-700 border-purple-200',
  DATABASE: 'bg-amber-50 text-amber-700 border-amber-200',
  DEVOPS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MOBILE: 'bg-pink-50 text-pink-700 border-pink-200',
  OTHER: 'bg-gray-50 text-gray-700 border-gray-200',
}

// ── Add Tech Bar ─────────────────────────────────────────────────────────────

interface AddBarProps {
  projectId: string
}

function AddTechBar({ projectId }: AddBarProps) {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<TechCategory>('FRONTEND')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const suggestionsQuery = useQuery({
    queryKey: ['projects', 'tech-catalog', query],
    queryFn: () => searchTechCatalog(query || undefined),
    enabled: showSuggestions,
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addMutation = useMutation({
    mutationFn: (data: { name: string; category: TechCategory }) =>
      addProjectTech(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'techs'] })
      setQuery('')
      setShowSuggestions(false)
    },
  })

  function handleAdd(name: string, cat?: TechCategory) {
    if (!name.trim()) return
    addMutation.mutate({ name: name.trim(), category: cat ?? category })
  }

  function handleSelectSuggestion(s: TechCatalogResponse) {
    handleAdd(s.name, s.category)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Agregar tecnología</h3>
      <div className="flex gap-2 flex-wrap relative" ref={wrapperRef}>
        <div className="flex-1 min-w-[180px] relative">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd(query)
              }
            }}
            placeholder="Buscar o escribir tecnología..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSuggestions && suggestionsQuery.data && suggestionsQuery.data.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {suggestionsQuery.data.slice(0, 12).map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-2"
                >
                  <span className="text-gray-800">{s.name}</span>
                  <span className="text-xs text-gray-400">{CATEGORY_LABELS[s.category]}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as TechCategory)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => handleAdd(query)}
          disabled={!query.trim() || addMutation.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {addMutation.isPending ? 'Agregando...' : 'Agregar'}
        </button>
      </div>
      {addMutation.isError && (
        <p className="text-xs text-red-600 mt-2">Error al agregar la tecnología.</p>
      )}
    </div>
  )
}

// ── Tech Chip ────────────────────────────────────────────────────────────────

interface ChipProps {
  tech: ProjectTechResponse
  onRemove: () => void
}

function TechChip({ tech, onRemove }: ChipProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${CATEGORY_COLORS[tech.category]}`}
    >
      {tech.name}
      <button
        type="button"
        onClick={onRemove}
        className="hover:bg-black/10 rounded p-0.5"
        aria-label="Eliminar"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.span>
  )
}

// ── Main Tab Component ───────────────────────────────────────────────────────

export function ProjectStackTab({ projectId }: Props) {
  const queryClient = useQueryClient()

  const techsQuery = useQuery({
    queryKey: ['projects', projectId, 'techs'],
    queryFn: () => getProjectTechs(projectId),
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => removeProjectTech(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'techs'] })
    },
  })

  const grouped: Record<TechCategory, ProjectTechResponse[]> = {
    FRONTEND: [], BACKEND: [], DATABASE: [], DEVOPS: [], MOBILE: [], OTHER: [],
  }
  techsQuery.data?.forEach(t => { grouped[t.category].push(t) })

  return (
    <div className="space-y-4">
      <AddTechBar projectId={projectId} />

      {techsQuery.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          Error al cargar el stack.
        </div>
      )}

      {techsQuery.isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="h-16 bg-gray-100 rounded animate-pulse" />
        </div>
      )}

      {techsQuery.data && techsQuery.data.length === 0 && (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-sm font-medium">Sin tecnologías</p>
          <p className="text-xs mt-1">Agrega las tecnologías que usa este proyecto</p>
        </div>
      )}

      {techsQuery.data && techsQuery.data.length > 0 && (
        <div className="space-y-4">
          {CATEGORIES.filter(c => grouped[c].length > 0).map(c => (
            <section key={c} className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {CATEGORY_LABELS[c]}
              </h3>
              <AnimatePresence initial={false}>
                <div className="flex flex-wrap gap-2">
                  {grouped[c].map(t => (
                    <TechChip
                      key={t.id}
                      tech={t}
                      onRemove={() => removeMutation.mutate(t.id)}
                    />
                  ))}
                </div>
              </AnimatePresence>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
