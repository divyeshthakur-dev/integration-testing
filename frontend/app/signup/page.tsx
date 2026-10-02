'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import { ApiResponse } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  useAuth(); // AuthContext consumed for session awareness (login not called directly in signup flow)

  const [step, setStep] = useState<'signup' | 'totp' | 'recovery'>('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [totpCode, setTotpCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tempSecret, setTempSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<ApiResponse<{ totpSetup?: { qrCodeDataUrl: string; secret: string } }>>(
        '/api/auth/signup',
        { name: form.name, email: form.email, password: form.password }
      );

      if (data.data?.totpSetup?.qrCodeDataUrl) {
        setTempSecret(data.data.totpSetup.secret);
        setQrCodeUrl(data.data.totpSetup.qrCodeDataUrl);
        setStep('totp');
      } else {
        router.push('/login');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTotp = async (e: FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/verify-totp', {
        name: form.name,
        email: form.email,
        password: form.password,
        secret: tempSecret,
        token: totpCode,
      });
      setRecoveryCodes(data.data.recoveryCodes);
      setStep('recovery');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepMeta = {
    signup:   { icon: '👤', title: 'Create Account',    sub: 'Join ShopX and start shopping' },
    totp:     { icon: '🔐', title: 'Set up 2FA',        sub: 'Scan the QR code with your authenticator app' },
    recovery: { icon: '🛡️', title: 'Recovery Codes',    sub: 'Save these codes somewhere safe' },
  };
  const meta = stepMeta[step];

  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 60px) 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          top: '-100px', right: '-100px',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: step === 'recovery' ? '480px' : '420px',
          padding: 'clamp(28px, 5vw, 44px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}
          >
            {meta.icon}
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {meta.title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{meta.sub}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Step: Signup Form */}
        {step === 'signup' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="input-label" htmlFor="signup-name">Full Name</label>
              <input
                id="signup-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="input-field"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="signup-email">Email Address</label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                className="input-field"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="signup-confirm">Confirm Password</label>
              <input
                id="signup-confirm"
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                className="input-field"
                autoComplete="new-password"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1rem', marginTop: '4px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px' }} />
                  Creating account...
                </>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>
        )}

        {/* Step: TOTP Setup */}
        {step === 'totp' && (
          <form onSubmit={handleVerifyTotp} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            {qrCodeUrl && (
              <div>
                <div
                  style={{
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <Image src={qrCodeUrl} alt="2FA QR Code" width={180} height={180} unoptimized style={{ display: 'block' }} />
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  Scan with Google Authenticator, Authy, or similar
                </p>
              </div>
            )}

            <div style={{ width: '100%' }}>
              <label className="input-label" htmlFor="totp-code">Authenticator Code</label>
              <input
                id="totp-code"
                type="text"
                value={totpCode}
                onChange={(e) => { setTotpCode(e.target.value); setError(''); }}
                placeholder="123456"
                required
                className="input-field"
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.25rem', fontWeight: 700 }}
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <button
              id="totp-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1rem' }}
            >
              {loading ? 'Verifying...' : '✓ Verify Setup'}
            </button>
          </form>
        )}

        {/* Step: Recovery Codes */}
        {step === 'recovery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="alert alert-warning" style={{ fontSize: '0.84rem' }}>
              ⚠️ Save these codes now! Each can be used once to log in if you lose access to your authenticator.
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'rgba(0,0,0,0.25)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '0.92rem',
              }}
            >
              {recoveryCodes.map((code, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    borderRadius: '6px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground-2)',
                    letterSpacing: '1px',
                  }}
                >
                  {code}
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/login')}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1rem' }}
            >
              ✅ I have saved these codes
            </button>
          </div>
        )}

        {/* Footer: Sign-in Link */}
        {step === 'signup' && (
          <>
            <div className="divider" style={{ margin: '20px 0' }} />
            <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
