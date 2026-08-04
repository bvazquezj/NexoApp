import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../../api/auth.api'
import { useAuthStore } from '../../../stores/useAuthStore'
import { AuthLayout } from '../components/AuthLayout'

type Status = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const login = useAuthStore(s => s.login)

  const [status, setStatus] = useState<Status>('loading')
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      return
    }

    authApi.verifyEmail(token)
      .then((response) => {
        login(response)
        setStatus('success')
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
      })
      .catch(() => {
        setStatus('error')
      })
  }, [searchParams, login, navigate])

  return (
    <AuthLayout title="Verificación de email" subtitle="Confirma tu cuenta para entrar a Nexo.">
      <div className="flex flex-col items-center rounded-xl2 border border-slate-200 bg-white px-6 py-12 text-center shadow-soft">
        {status === 'loading' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
            </div>
            <p className="mt-5 text-sm text-slate-600">Verificando tu cuenta...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-50/60">
              <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-5 font-display text-lg font-semibold text-ink-900">Cuenta verificada</h1>
            <p className="mt-1 text-sm text-slate-500">Iniciando sesión...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-50/60">
              <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-5 font-display text-lg font-semibold text-ink-900">Link inválido</h1>
            <p className="mt-1 text-sm text-slate-500">El link expiró o ya fue usado.</p>
            <button onClick={() => navigate('/verify-email/pending')} className="btn-primary mt-6 w-full">
              Solicitar nuevo link
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
