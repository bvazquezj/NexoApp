import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, parseISO, differenceInCalendarDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProjectSummaryResponse } from '../../types/project.types'
import { ProjectStatusBadge } from './ProjectStatusBadge'

interface Props {
  project: ProjectSummaryResponse
  index?: number
}

function DueDateChip({ dueDate }: { dueDate: string }) {
  const date = parseISO(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = differenceInCalendarDays(date, today)

  const icon = (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )

  let cls = 'bg-gray-100 text-gray-600'
  if (diff < 0) {
    cls = 'bg-red-100 text-red-700'
  } else if (diff <= 3) {
    cls = 'bg-orange-100 text-orange-700'
  } else if (diff <= 7) {
    cls = 'bg-yellow-100 text-yellow-700'
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {icon}
      {format(date, "d MMM yyyy", { locale: es })}
      {diff < 0 && <span className="font-semibold">· vencido</span>}
    </span>
  )
}

export function ProjectCard({ project, index = 0 }: Props) {
  const navigate = useNavigate()
  const color = project.category.color

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.03 }}
      onClick={() => navigate(`/projects/${project.id}`)}
      className="text-left bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden relative"
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: color }}
      />
      <div className="p-4 pl-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
            {project.name}
          </h3>
          <ProjectStatusBadge status={project.status} size="sm" />
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}1A`, color }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            {project.category.name}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">{project.completedTasks}/{project.totalTasks} tareas</span>
            <span className="font-semibold text-gray-700">{project.progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${project.progressPercent}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>

        <DueDateChip dueDate={project.dueDate} />
      </div>
    </motion.button>
  )
}
