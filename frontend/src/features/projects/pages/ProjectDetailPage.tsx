import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/AppLayout'
import { ProjectStatusBadge } from '../../../components/projects/ProjectStatusBadge'
import { ProjectStatusActions } from '../../../components/projects/ProjectStatusActions'
import { ProjectDetailSubNav } from '../../../components/projects/ProjectDetailSubNav'
import { ProjectFormModal } from '../../../components/projects/ProjectFormModal'
import { ProjectOverviewTab } from '../../../components/projects/tabs/ProjectOverviewTab'
import { ProjectTasksTab } from '../../../components/projects/tabs/ProjectTasksTab'
import { ProjectIterationsTab } from '../../../components/projects/tabs/ProjectIterationsTab'
import { ProjectNotesTab } from '../../../components/projects/tabs/ProjectNotesTab'
import { ProjectLinksTab } from '../../../components/projects/tabs/ProjectLinksTab'
import { ProjectStackTab } from '../../../components/projects/tabs/ProjectStackTab'
import { useProjectStore } from '../../../stores/useProjectStore'
import { getProject, updateProject, deleteProject } from '../../../api/projects.api'
import type { ProjectResponse } from '../../../types/project.types'

function ProjectHeader({ project }: { project: ProjectResponse }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const titleMutation = useMutation({
    mutationFn: (name: string) => updateProject(project.id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', project.id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setEditingTitle(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/projects')
    },
  })

  function handleTitleSave() {
    const trimmed = titleValue.trim()
    if (!trimmed || trimmed === project.name) {
      setEditingTitle(false)
      return
    }
    titleMutation.mutate(trimmed)
  }

  function startEditTitle() {
    setTitleValue(project.name)
    setEditingTitle(true)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  function handleDelete() {
    if (window.confirm('¿Eliminar este proyecto?\n\nSe podrá restaurar desde la papelera.')) {
      deleteMutation.mutate()
    }
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span
            className="w-1.5 self-stretch rounded-full flex-shrink-0"
            style={{ backgroundColor: project.category.color }}
          />
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleValue}
                onChange={e => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTitleSave()
                  if (e.key === 'Escape') setEditingTitle(false)
                }}
                className="w-full text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                maxLength={150}
              />
            ) : (
              <h1
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-700 transition-colors"
                onClick={startEditTitle}
                title="Click para editar"
              >
                {project.name}
              </h1>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ProjectStatusBadge status={project.status} />
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${project.category.color}1A`, color: project.category.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.category.color }} />
                {project.category.name}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{project.completedTasks}</span>
            <span className="text-gray-500"> / {project.totalTasks} tareas</span>
          </span>
          <span className="font-bold text-gray-900">{project.progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all"
            style={{
              width: `${project.progressPercent}%`,
              backgroundColor: project.category.color,
            }}
          />
        </div>
      </div>

      {/* Status transitions */}
      <ProjectStatusActions projectId={project.id} status={project.status} />

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
      />
    </section>
  )
}

function TabContent({ project }: { project: ProjectResponse }) {
  const { activeTab } = useProjectStore()

  switch (activeTab) {
    case 'overview':
      return <ProjectOverviewTab project={project} />
    case 'tasks':
      return <ProjectTasksTab project={project} />
    case 'iterations':
      return <ProjectIterationsTab project={project} />
    case 'notes':
      return <ProjectNotesTab projectId={project.id} />
    case 'links':
      return <ProjectLinksTab projectId={project.id} />
    case 'stack':
      return <ProjectStackTab projectId={project.id} />
    default:
      return null
  }
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activeTab, setActiveTab } = useProjectStore()

  // Reset to overview when navigating to a different project
  useEffect(() => {
    setActiveTab('overview')
  }, [id, setActiveTab])

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => getProject(id!),
    enabled: Boolean(id),
  })

  if (!id) {
    return (
      <AppLayout>
        <div className="p-6">
          <p className="text-sm text-red-600">Proyecto inválido.</p>
        </div>
      </AppLayout>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (isError || !project) {
    return (
      <AppLayout>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            No se pudo cargar el proyecto.
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <button
          type="button"
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a proyectos
        </button>

        <ProjectHeader project={project} />

        <ProjectDetailSubNav active={activeTab} onChange={setActiveTab} />

        <TabContent project={project} />
      </div>
    </AppLayout>
  )
}
