'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { ApiResponse, User } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  
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
      const { data } = await api.post<ApiResponse<{ totpSetup?: { qrCodeDataUrl: string, secret: string } }>>('/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      
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
        token: totpCode 
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

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      {/* Background orb */}
      <div
        style={{
          position: 'fixed',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          top: '-100px',
          right: '-100px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        className="glass-card animate-fade-in"
        style={{ width: '100%', maxWidth: step === 'recovery' ? '500px' : '440px', padding: '40px', position: 'relative', zIndex: 1 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 16px',
            }}
          >
            {step === 'signup' ? '👤' : step === 'totp' ? '🔐' : '📄'}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
            {step === 'signup' && 'Create Account'}
            {step === 'totp' && 'Set up 2FA'}
            {step === 'recovery' && 'Recovery Codes'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {step === 'signup' && 'Join ShopX and start shopping'}
            {step === 'totp' && 'Scan the QR code with your authenticator app'}
            {step === 'recovery' && 'Save these codes in a secure place'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {step === 'signup' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Full Name
              </label>
              <input
                id="signup-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
                className="input-field"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '4px' }}
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

        {step === 'totp' && (
          <form onSubmit={handleVerifyTotp} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {qrCodeUrl && (
              <div style={{ background: '#fff', padding: '10px', borderRadius: '8px' }}>
                <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '200px', height: '200px' }} />
              </div>
            )}
            
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                Authenticator Code
              </label>
              <input
                id="totp-code"
                type="text"
                value={totpCode}
                onChange={(e) => { setTotpCode(e.target.value); setError(''); }}
                placeholder="123456"
                required
                className="input-field"
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
              />
            </div>

            <button
              id="totp-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '4px' }}
            >
              {loading ? 'Verifying...' : 'Verify Setup'}
            </button>
          </form>
        )}

        {step === 'recovery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'rgba(0,0,0,0.2)',
                padding: '16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '1rem',
              }}
            >
              {recoveryCodes.map((code, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '4px' }}>
                  {code}
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '4px' }}
            >
              I have saved these codes
            </button>
          </div>
        )}

        {step === 'signup' && (
          <>
            <div className="divider" />
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
