import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { importEnvVars } from '../../../api/deployments.api'
import type { ImportEnvVarsResponse, EnvVarType } from '../../../types/deployment.types'

interface Props {
  open: boolean
  onClose: () => void
  deploymentId: string
}

export function ImportEnvVarsModal({ open, onClose, deploymentId }: Props) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [defaultType, setDefaultType] = useState<EnvVarType>('PUBLIC')
  const [result, setResult] = useState<ImportEnvVarsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setContent('')
      setDefaultType('PUBLIC')
      setResult(null)
      setError(null)
    }
  }, [open])

  const mutation = useMutation({
    mutationFn: () => importEnvVars(deploymentId, { content, defaultType }),
    onSuccess: (res) => {
      setResult(res)
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId, 'env-vars'] })
    },
    onError: () => setError('No se pudo importar el .env.'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    if (content.trim().length === 0) {
      setError('Pega el contenido del archivo .env.')
      return
    }
    mutation.mutate()
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
              className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Importar .env</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenido <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={10}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={`API_URL=https://api.example.com\nDB_PASSWORD=secret123\n# comentarios soportados`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo por defecto</label>
                  <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                    {(['PUBLIC', 'SECRET'] as EnvVarType[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDefaultType(t)}
                        className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                          defaultType === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Cada variable se creará con este tipo salvo que ya exista.
                  </p>
                </div>

                {result && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900 space-y-1">
                    <p>
                      <span className="font-semibold">{result.imported}</span> variables importadas,{' '}
                      <span className="font-semibold">{result.skipped}</span> omitidas.
                    </p>
                    {result.errors.length > 0 && (
                      <ul className="text-xs text-blue-800 list-disc list-inside">
                        {result.errors.slice(0, 8).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                        {result.errors.length > 8 && <li>...y {result.errors.length - 8} más</li>}
                      </ul>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {result ? 'Cerrar' : 'Cancelar'}
                  </button>
                  {!result && (
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {mutation.isPending ? 'Importando...' : 'Importar'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
