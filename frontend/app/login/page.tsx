'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { ApiResponse, User } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<'login' | 'totp'>('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [totpCode, setTotpCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = step === 'totp' ? { ...form, totpCode } : form;
      const { data } = await api.post<any>('/api/auth/login', payload);

      if (data.require2FA) {
        setStep('totp');
      } else {
        login(data.data);
        router.push('/products');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Background Orb */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)',
          bottom: '-100px',
          left: '-100px',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          top: '-80px',
          right: '-80px',
          pointerEvents: 'none',
        }}
      />

      {/* Card */}
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
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
              background: step === 'login'
                ? 'linear-gradient(135deg, var(--secondary), var(--primary))'
                : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}
          >
            {step === 'login' ? '🔑' : '🔐'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
            {step === 'login' ? 'Welcome Back' : 'Two-Factor Auth'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {step === 'login'
              ? 'Sign in to your ShopX account'
              : 'Enter the code from your authenticator app or a recovery code'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Hint */}
        {step === 'login' && (
          <div className="alert alert-info" style={{ marginBottom: '20px', fontSize: '0.82rem' }}>
            💡 New here?{' '}
            <Link href="/signup" style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
              Create a free account
            </Link>{' '}
            to get started.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {step === 'login' ? (
            <>
              <div>
                <label className="input-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
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
                <label className="input-label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  className="input-field"
                  autoComplete="current-password"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="input-label" htmlFor="login-totp">Authenticator Code</label>
              <input
                id="login-totp"
                type="text"
                name="totpCode"
                value={totpCode}
                onChange={(e) => { setTotpCode(e.target.value); setError(''); }}
                placeholder="123456"
                required
                className="input-field"
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.25rem', fontWeight: 700 }}
                maxLength={8}
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '15px', fontSize: '1rem', marginTop: '4px' }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: '18px', height: '18px' }} />
                Signing in...
              </>
            ) : (
              step === 'login' ? '🔐 Sign In' : 'Verify Code'
            )}
          </button>
        </form>

        {/* Passkey Login */}
        {step === 'login' && (
          <div style={{ marginTop: '16px' }}>
            <div className="divider" style={{ margin: '20px 0' }} />
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setError('');
                try {
                  const { startAuthentication } = await import('@simplewebauthn/browser');
                  const resp = await api.get(
                    '/api/auth/passkey/login-options' +
                      (form.email ? `?email=${encodeURIComponent(form.email)}` : '')
                  );
                  const { options, sessionId } = resp.data.data;
                  const asseResp = await startAuthentication({ optionsJSON: options });

                  const verifyResp = await api.post('/api/auth/passkey/login-verify', {
                    ...asseResp,
                    extraInfo: { email: form.email, sessionId },
                  });

                  if (verifyResp.data.success) {
                    login(verifyResp.data.data);
                    router.push('/products');
                  }
                } catch (err: any) {
                  setError(err.response?.data?.message || err.message || 'Passkey login failed');
                } finally {
                  setLoading(false);
                }
              }}
              className="btn-secondary"
              style={{ width: '100%', padding: '14px', fontSize: '0.94rem' }}
            >
              👆 Use Passkey (Fingerprint / Face ID)
            </button>
          </div>
        )}

        {/* Footer */}
        {step === 'login' && (
          <>
            <div className="divider" style={{ margin: '20px 0' }} />
            <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                Sign up free
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
