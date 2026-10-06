'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, AlertCircle, Key, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) return
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/login')
      }, 2500)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" dir="ltr">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--gradient)',
              boxShadow: '0 0 32px var(--ring)',
            }}
          >
            <Lock size={22} color="#fff" />
          </div>
        </div>

        <h1
          className="text-2xl font-bold text-center mb-1"
          style={{ color: 'var(--foreground)' }}
        >
          Reset Password
        </h1>
        <p
          className="text-sm text-center mb-8"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          Enter your new password below
        </p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl text-center glass-card"
          >
            <CheckCircle size={32} style={{ color: '#22c55e' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Password updated successfully!
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
              Redirecting to login page…
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-3 pl-10 pr-10 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--glass-border)'}`,
                  color: 'var(--foreground)',
                }}
              />
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 pl-10 pr-10 rounded-2xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--glass-border)'}`,
                  color: 'var(--foreground)',
                }}
              />
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs px-1"
                style={{ color: 'rgb(239,68,68)' }}
              >
                <AlertCircle size={13} />
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !password.trim() || !confirmPassword.trim()}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white gradient-bg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 20px var(--ring)' }}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  Update Password
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </main>
  )
}
