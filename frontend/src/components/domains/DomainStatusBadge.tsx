import type { DomainEffectiveStatus } from '../../types/domain.types'

interface Props {
  status: DomainEffectiveStatus
}

const CONFIG: Record<DomainEffectiveStatus, { label: string; classes: string }> = {
  ACTIVE:        { label: 'Activo',      classes: 'bg-green-100 text-green-700' },
  EXPIRING_SOON: { label: 'Por vencer',  classes: 'bg-amber-100 text-amber-700' },
  EXPIRED:       { label: 'Vencido',     classes: 'bg-red-100 text-red-700' },
  TRANSFERRED:   { label: 'Transferido', classes: 'bg-gray-100 text-gray-700' },
  RELEASED:      { label: 'Liberado',    classes: 'bg-gray-200 text-gray-800' },
}

export function DomainStatusBadge({ status }: Props) {
  const cfg = CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
