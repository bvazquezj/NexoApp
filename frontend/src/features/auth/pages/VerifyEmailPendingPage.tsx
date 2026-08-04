import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { authApi } from '../../../api/auth.api'
import { AuthLayout } from '../components/AuthLayout'

const COOLDOWN_SECONDS = 60

export function VerifyEmailPendingPage() {
  const [searchParams] = useSearchParams()

  const emailFromParam = searchParams.get('email')
  const emailFromStorage = sessionStorage.getItem('pendingVerificationEmail')
  const email = emailFromParam ?? emailFromStorage ?? ''

  const [cooldown, setCooldown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleResend() {
    if (!email || cooldown > 0) return
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      await authApi.resendVerification(email)
      setSuccessMessage('Email de verificación reenviado.')
      startCooldown()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'No se pudo reenviar el email. Intenta de nuevo.')
      } else {
        setError('No se pudo reenviar el email. Intenta de nuevo.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Verifica tu email" subtitle="Un último paso para activar tu cuenta.">
      <div className="flex flex-col items-center rounded-xl2 border border-slate-200 bg-white px-6 py-12 text-center shadow-soft">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-50/60">
          <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {email ? (
          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            Revisa tu correo en <span className="font-semibold text-ink-900">{email}</span> y haz clic en el
            link de verificación.
          </p>
        ) : (
          <p className="mt-5 text-sm text-slate-600">
            Revisa tu correo y haz clic en el link de verificación.
          </p>
        )}

        {successMessage && (
          <p className="mt-5 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        {error && <p className="mt-5 w-full text-sm text-red-600">{error}</p>}

        <button
          onClick={handleResend}
          disabled={isLoading || cooldown > 0}
          className="btn-primary mt-6 w-full"
        >
          {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />}
          {cooldown > 0
            ? `Reenviar en ${cooldown}s`
            : 'Reenviar email de verificación'}
        </button>
      </div>
    </AuthLayout>
  )
}
