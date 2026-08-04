import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getProjectTechs,
  getProjectLinks,
  getProjectNotes,
} from '../../../api/projects.api'
import { ProjectLinkIcon, LINK_TYPE_LABELS } from '../ProjectLinkIcon'
import type { ProjectResponse } from '../../../types/project.types'

interface Props {
  project: ProjectResponse
}

function fmt(iso: string | null | undefined) {
  if (!iso) return '—'
  return format(parseISO(iso), "d MMM yyyy", { locale: es })
}

function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return '—'
  return format(parseISO(iso), "d MMM yyyy, HH:mm", { locale: es })
}

export function ProjectOverviewTab({ project }: Props) {
  const techsQuery = useQuery({
    queryKey: ['projects', project.id, 'techs'],
    queryFn: () => getProjectTechs(project.id),
  })

  const linksQuery = useQuery({
    queryKey: ['projects', project.id, 'links'],
    queryFn: () => getProjectLinks(project.id),
  })

  const notesQuery = useQuery({
    queryKey: ['projects', project.id, 'notes'],
    queryFn: () => getProjectNotes(project.id),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Description + general info */}
      <div className="lg:col-span-2 space-y-4">
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Descripción</h3>
          {project.description ? (
            <div className="markdown-body text-sm text-gray-700 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.description}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin descripción</p>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Información general</h3>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <dt className="text-gray-500">Categoría</dt>
            <dd className="text-gray-800">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.category.color }}
                />
                {project.category.name}
              </span>
            </dd>
            <dt className="text-gray-500">Fecha inicio</dt>
            <dd className="text-gray-800">{fmt(project.startDate)}</dd>
            <dt className="text-gray-500">Fecha entrega</dt>
            <dd className="text-gray-800 font-medium">{fmt(project.dueDate)}</dd>
            {project.inProgressAt && (
              <>
                <dt className="text-gray-500">Iniciado el</dt>
                <dd className="text-gray-800">{fmtDateTime(project.inProgressAt)}</dd>
              </>
            )}
            {project.completedAt && (
              <>
                <dt className="text-gray-500">Completado el</dt>
                <dd className="text-gray-800">{fmtDateTime(project.completedAt)}</dd>
              </>
            )}
            <dt className="text-gray-500">Creado</dt>
            <dd className="text-gray-800">{fmtDateTime(project.createdAt)}</dd>
            <dt className="text-gray-500">Actualizado</dt>
            <dd className="text-gray-800">{fmtDateTime(project.updatedAt)}</dd>
          </dl>
        </section>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Stack tecnológico</h3>
          {techsQuery.isLoading && <div className="h-6 bg-gray-100 rounded animate-pulse" />}
          {techsQuery.data && techsQuery.data.length === 0 && (
            <p className="text-xs text-gray-400">Sin tecnologías asociadas.</p>
          )}
          {techsQuery.data && techsQuery.data.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {techsQuery.data.slice(0, 5).map(t => (
                <span
                  key={t.id}
                  className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                >
                  {t.name}
                </span>
              ))}
              {techsQuery.data.length > 5 && (
                <span className="text-xs text-gray-400 py-0.5">
                  +{techsQuery.data.length - 5} más
                </span>
              )}
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Links</h3>
          {linksQuery.isLoading && <div className="h-6 bg-gray-100 rounded animate-pulse" />}
          {linksQuery.data && linksQuery.data.length === 0 && (
            <p className="text-xs text-gray-400">Sin links.</p>
          )}
          {linksQuery.data && linksQuery.data.length > 0 && (
            <ul className="space-y-2">
              {linksQuery.data.slice(0, 3).map(l => (
                <li key={l.id} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500"><ProjectLinkIcon type={l.type} /></span>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate flex-1"
                    title={LINK_TYPE_LABELS[l.type]}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Últimas entradas</h3>
          {notesQuery.isLoading && <div className="h-12 bg-gray-100 rounded animate-pulse" />}
          {notesQuery.data && notesQuery.data.length === 0 && (
            <p className="text-xs text-gray-400">Sin entradas en el diario.</p>
          )}
          {notesQuery.data && notesQuery.data.length > 0 && (
            <ul className="space-y-3">
              {notesQuery.data.slice(0, 2).map(n => (
                <li key={n.id} className="border-l-2 border-blue-200 pl-3">
                  {n.title && (
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{fmtDateTime(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
