'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, AlertCircle, Mail, Key, Eye, EyeOff, CheckCircle2, ShieldCheck, ChevronLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
export default function AdminLoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('next') ?? '/admin'

  const [step, setStep] = useState<'login' | '2fa'>('login')
  const [mfaType, setMfaType] = useState<'totp' | 'email'>('totp')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(params.get('error') ? 'Authentication failed. Please try again.' : '')
  const [infoMessage, setInfoMessage] = useState('')

  // 2FA State
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Clear errors when step changes
  useEffect(() => setError(''), [step])

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')
    setInfoMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const assuranceLevel = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      
      if (assuranceLevel.data?.nextLevel === 'aal2' && assuranceLevel.data?.currentLevel === 'aal1') {
        setMfaType('totp')
        setStep('2fa')
        setLoading(false)
      } else if (data.user?.user_metadata?.email_login_enabled) {
        // Send email OTP
        const { error: otpError } = await supabase.auth.signInWithOtp({ email })
        if (otpError) {
          setError(otpError.message)
          setLoading(false)
        } else {
          setMfaType('email')
          setStep('2fa')
          setLoading(false)
        }
      } else {
        router.push(from)
        router.refresh()
      }
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)
    setError('')

    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    } else if (e.key === 'Enter') {
      handleVerify2FA(e as any)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      setError('')
      const focusIndex = Math.min(pastedData.length, 5)
      inputRefs[focusIndex].current?.focus()
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }

    setLoading(true)
    setError('')

    if (mfaType === 'totp') {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const totpFactor = factors?.totp[0]
      if (!totpFactor) {
        setError('No TOTP factor found')
        setLoading(false)
        return
      }
      
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id })
      if (challengeError) { setError(challengeError.message); setLoading(false); return }
      
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code
      })
      
      if (verifyError) { setError(verifyError.message); setLoading(false); return }
      
      router.push(from)
      router.refresh()
    } else {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      })
      if (verifyError) { setError(verifyError.message); setLoading(false); return }
      
      router.push(from)
      router.refresh()
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Please enter your email address first.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')
    setInfoMessage('')

    // Simulate reset password logic
    setTimeout(() => {
      setLoading(false)
      setInfoMessage('Password reset link sent to your email! Please check your inbox.')
    }, 1000)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" dir="ltr">
      <div className="w-full max-w-sm relative overflow-hidden p-2">
        <AnimatePresence mode="wait">
          {step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full"
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
                Admin Access
              </h1>
              <p
                className="text-sm text-center mb-8"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Sign in to manage your portfolio
              </p>

              <div className="flex flex-col gap-4">
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-4" noValidate={true}>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-3 pl-10 rounded-2xl text-sm outline-none transition-all"
                      style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--glass-border)'}`,
                        color: 'var(--foreground)',
                      }}
                    />
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)]" />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
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

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-[var(--foreground-secondary)] hover:text-[var(--primary-accent)] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {infoMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 text-xs p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    >
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                      <span>{infoMessage}</span>
                    </motion.div>
                  )}

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
                    disabled={loading || !email.trim() || !password.trim()}
                    className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white gradient-bg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: '0 4px 20px var(--ring)' }}
                  >
                    {loading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        Continue to Security
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === '2fa' && (
            <motion.div
              key="2fa"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full"
            >
              <div className="flex justify-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'var(--gradient)',
                    boxShadow: '0 0 32px var(--ring)',
                  }}
                >
                  {mfaType === 'totp' ? <ShieldCheck size={22} color="#fff" /> : <Mail size={22} color="#fff" />}
                </div>
              </div>

              <h1
                className="text-2xl font-bold text-center mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                {mfaType === 'totp' ? 'Two-Factor Auth' : 'Email Verification'}
              </h1>
              <p
                className="text-sm text-center mb-8 px-4"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {mfaType === 'totp' 
                  ? 'Enter the 6-digit code from your authenticator app' 
                  : 'Enter the 6-digit code sent to your email'}
              </p>

              <div className="flex flex-col gap-4">
                <form onSubmit={handleVerify2FA} className="flex flex-col gap-5">
                  <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl outline-none transition-all focus:border-[var(--primary-accent)]"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--glass-border)',
                          color: 'var(--foreground)',
                        }}
                      />
                    ))}
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

                  <div className="flex flex-col gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={loading || otp.join('').length < 6}
                      className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white gradient-bg transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ boxShadow: '0 4px 20px var(--ring)' }}
                    >
                      {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        'Verify Identity'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setStep('login')}
                      className="flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                      style={{
                        background: 'transparent',
                        color: 'var(--foreground-secondary)',
                      }}
                    >
                      <ChevronLeft size={15} /> Back to login
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
