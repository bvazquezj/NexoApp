import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTaskUIStore } from '../../stores/useTaskUIStore'

export function ClosingCommentModal() {
  const { closingModal, closeClosingModal } = useTaskUIStore()
  const [comment, setComment] = useState('')

  const open = closingModal?.open ?? false

  useEffect(() => {
    if (!open) setComment('')
  }, [open])

  function handleConfirm() {
    if (comment.trim().length < 10) return
    closingModal?.onConfirm?.(comment.trim())
    closeClosingModal()
  }

  function handleCancel() {
    closeClosingModal()
    setComment('')
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleCancel}
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
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Comentario de cierre
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Describe brevemente como se completo esta tarea (minimo 10 caracteres).
              </p>

              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Escribe el comentario de cierre..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                autoFocus
              />

              <div className="flex items-center justify-between mt-2 mb-4">
                <span className="text-xs text-gray-400">
                  {comment.length} caracteres
                </span>
                {comment.length > 0 && comment.length < 10 && (
                  <span className="text-xs text-red-500">
                    Minimo 10 caracteres
                  </span>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={comment.trim().length < 10}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
