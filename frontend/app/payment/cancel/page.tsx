'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{ maxWidth: '480px', padding: '48px 32px' }}
      >
        {/* Warning icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            margin: '0 auto 20px',
            boxShadow: '0 0 0 8px rgba(245,158,11,0.15)',
          }}
        >
          ✕
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
          Payment Cancelled
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            marginBottom: '28px',
            lineHeight: 1.6,
          }}
        >
          Your payment was not completed. Don&apos;t worry — your order has been
          saved and you can retry payment anytime from your orders page.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {orderId && (
            <Link
              href={`/order-success/${orderId}`}
              className="btn-secondary"
              style={{ padding: '12px 24px' }}
            >
              📦 View Order
            </Link>
          )}
          <Link
            href="/orders"
            className="btn-secondary"
            style={{ padding: '12px 24px' }}
          >
            📋 My Orders
          </Link>
          <Link
            href="/products"
            className="btn-primary"
            style={{ padding: '12px 24px' }}
          >
            🛍️ Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="spinner" style={{ width: '40px', height: '40px' }} />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  );
}
