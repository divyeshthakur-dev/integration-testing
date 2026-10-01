'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function EmailTestPage() {
  const [provider, setProvider] = useState('resend');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('delivered@resend.dev');
  const [subject, setSubject] = useState('Integration Testing - Resend');
  const [body, setBody] = useState('<h1>Resend Test</h1><p>This is a test email from my integration-testing project.</p>');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    if (newProvider === 'resend') {
      setFrom('');
      setTo('delivered@resend.dev');
      setSubject('Integration Testing - Resend');
      setBody('<h1>Resend Test</h1><p>This is a test email from my integration-testing project.</p>');
    } else if (newProvider === 'mailjet') {
      setFrom('divyeshthakur@grewon.com');
      setTo('YOUR_OTHER_GMAIL_ADDRESS');
      setSubject('Mailjet Integration Test');
      setBody('<h1>Mailjet Test</h1><p>This is a Mailjet integration test.</p>');
    } else if (newProvider === 'mailtrap') {
      setFrom('hello@demomailtrap.com');
      setTo('YOUR_OTHER_GMAIL_ADDRESS');
      setSubject('Mailtrap Integration Test');
      setBody('<h1>Mailtrap Test</h1><p>This is a Mailtrap integration test.</p>');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await api.post('/email/send', { provider, from, to, subject, body });
      setStatus({ type: 'success', message: response.data.message || 'Email sent successfully!' });
    } catch (err: unknown) {
      let errorMsg = 'Failed to send email';
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axErr = err as { response?: { data?: { message?: string } } };
        if (axErr.response?.data?.message) {
          errorMsg = axErr.response.data.message;
        }
      }
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '2rem', fontWeight: 800 }}>Test Email Providers</h1>
      
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Provider</label>
            <select 
              value={provider} 
              onChange={handleProviderChange}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            >
              <option value="resend">Resend</option>
              <option value="brevo">Brevo</option>
              <option value="mailjet">Mailjet</option>
              <option value="mailtrap">Mailtrap</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>From Email (Optional)</label>
            <input 
              type="email" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)}
              placeholder="sender@example.com"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>To Email</label>
            <input 
              type="email" 
              required
              value={to} 
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Subject</label>
            <input 
              type="text" 
              required
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Test Subject"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>HTML Body</label>
            <textarea 
              required
              value={body} 
              onChange={(e) => setBody(e.target.value)}
              placeholder="<h1>Hello from Test API</h1>"
              rows={5}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ padding: '14px', fontSize: '1rem', marginTop: '8px' }}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </form>

        {status.message && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            borderRadius: '8px', 
            background: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${status.type === 'success' ? '#22c55e' : '#ef4444'}`,
            color: status.type === 'success' ? '#22c55e' : '#ef4444'
          }}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}
