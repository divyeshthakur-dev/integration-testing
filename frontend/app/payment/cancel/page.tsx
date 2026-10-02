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
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(24px, 5vw, 60px) 16px',
      }}
    >
      <div
        className="glass-card animate-fade-in"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: 'clamp(32px, 6vw, 52px) clamp(24px, 4vw, 40px)',
          textAlign: 'center',
        }}
      >
        {/* Warning icon */}
        <div
          style={{
            width: 'clamp(64px, 12vw, 80px)',
            height: 'clamp(64px, 12vw, 80px)',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(28px, 5vw, 38px)',
            margin: '0 auto 20px',
            boxShadow: '0 0 0 10px rgba(245,158,11,0.1)',
          }}
        >
          ✕
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 1.85rem)',
            fontWeight: 800,
            marginBottom: '10px',
            letterSpacing: '-0.02em',
          }}
        >
          Payment Cancelled
        </h1>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            marginBottom: '28px',
            lineHeight: 1.65,
          }}
        >
          Your payment was not completed. Don&apos;t worry — your order has been saved
          and you can retry payment anytime from your orders page.
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
            <Link href={`/order-success/${orderId}`} className="btn-secondary" style={{ padding: '12px 22px' }}>
              📦 View Order
            </Link>
          )}
          <Link href="/orders" className="btn-secondary" style={{ padding: '12px 22px' }}>
            📋 My Orders
          </Link>
          <Link href="/products" className="btn-primary" style={{ padding: '12px 22px' }}>
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
            minHeight: 'calc(100vh - var(--nav-height))',
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
