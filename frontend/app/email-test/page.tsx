'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export default function EmailTestPage() {
  const [provider, setProvider] = useState('resend');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('delivered@resend.dev');
  const [subject, setSubject] = useState('Integration Testing - Resend');
  const [body, setBody] = useState('<h1>Resend Test</h1><p>This is a test email from my integration-testing project.</p>');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const emailMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/email/send', { provider, from, to, subject, body });
      return response.data;
    },
    onSuccess: (data) => {
      setStatus({ type: 'success', message: data?.message || 'Email sent successfully!' });
    },
    onError: (err: unknown) => {
      let errorMsg = 'Failed to send email';
      if (err instanceof Error) errorMsg = err.message;
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axErr = err as { response?: { data?: { message?: string } } };
        if (axErr.response?.data?.message) errorMsg = axErr.response.data.message;
      }
      setStatus({ type: 'error', message: errorMsg });
    },
  });

  const loading = emailMutation.isPending;

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });
    emailMutation.mutate();
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <h1 className="section-title">Test Email Providers</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.95rem' }}>
            Send a test email using different email providers
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: 'clamp(20px, 4vw, 32px)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Provider */}
            <div>
              <label className="input-label" htmlFor="email-provider">Provider</label>
              <select
                id="email-provider"
                value={provider}
                onChange={handleProviderChange}
                className="input-field"
              >
                <option value="resend">Resend</option>
                <option value="brevo">Brevo</option>
                <option value="mailjet">Mailjet</option>
                <option value="mailtrap">Mailtrap</option>
              </select>
            </div>

            {/* From */}
            <div>
              <label className="input-label" htmlFor="email-from">From Email (Optional)</label>
              <input
                id="email-from"
                type="email"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="sender@example.com"
                className="input-field"
              />
            </div>

            {/* To */}
            <div>
              <label className="input-label" htmlFor="email-to">To Email</label>
              <input
                id="email-to"
                type="email"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="input-field"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="input-label" htmlFor="email-subject">Subject</label>
              <input
                id="email-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Test Subject"
                className="input-field"
              />
            </div>

            {/* HTML Body */}
            <div>
              <label className="input-label" htmlFor="email-body">HTML Body</label>
              <textarea
                id="email-body"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="<h1>Hello from Test API</h1>"
                rows={5}
                className="input-field"
                style={{ resize: 'vertical', minHeight: '120px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '15px', fontSize: '1rem', marginTop: '4px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '18px', height: '18px' }} />
                  Sending…
                </>
              ) : (
                '📧 Send Test Email'
              )}
            </button>
          </form>

          {/* Status */}
          {status.message && (
            <div
              className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}
              style={{ marginTop: '20px' }}
            >
              {status.type === 'success' ? '✅' : '❌'} {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
