import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { revealEnvVar } from '../../../api/deployments.api'
import { copyToClipboard } from '../../../utils/deployment'

interface Props {
  open: boolean
  onClose: () => void
  deploymentId: string
  varId: string | null
  varKey: string
}

export function RevealEnvVarModal({ open, onClose, deploymentId, varId, varKey }: Props) {
  const [value, setValue] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open || !varId) {
      setValue(null)
      setError(null)
      setLoading(false)
      setCopied(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    revealEnvVar(deploymentId, varId)
      .then(res => {
        if (!cancelled) setValue(res.value)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo revelar la variable.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, varId, deploymentId])

  async function handleCopy() {
    if (!value) return
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Revelar variable</h2>
              <p className="text-xs text-gray-500 mb-4 font-mono">{varKey}</p>

              {loading && (
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-3">
                  {error}
                </div>
              )}

              {value !== null && !loading && (
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs text-gray-800 break-all max-h-40 overflow-y-auto">
                    {value}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    {copied ? 'Copiado!' : 'Copiar al portapapeles'}
                  </button>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                    El valor se borrará de la pantalla al cerrar este diálogo.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
