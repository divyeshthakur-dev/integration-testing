'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { queryKeys, fetchOrderById } from '@/lib/queries';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const {
    data: order,
    isLoading: loading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => fetchOrderById(id),
    enabled: isAuthenticated && !!id,
  });

  const error = isError
    ? queryError instanceof Error
      ? queryError.message
      : 'Could not load order details'
    : '';

  if (loading) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - var(--nav-height))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading order details…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="empty-state">
        <div className="empty-icon">😕</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Order not found</h2>
        <Link href="/products" className="btn-primary" style={{ marginTop: '8px' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const DELIVERY_STEPS = ['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
  const stepIndex: Record<string, number> = {
    pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4,
  };
  const currentStep = stepIndex[order.status] ?? 0;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '760px' }}>

        {/* Success Banner */}
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: 'clamp(32px, 6vw, 56px) clamp(20px, 4vw, 40px)',
            textAlign: 'center',
            marginBottom: 'clamp(20px, 3vw, 32px)',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(99,102,241,0.06) 100%)',
            borderColor: 'rgba(34,197,94,0.25)',
          }}
        >
          {/* Checkmark */}
          <div
            style={{
              width: 'clamp(64px, 10vw, 84px)',
              height: 'clamp(64px, 10vw, 84px)',
              background: 'linear-gradient(135deg, var(--success), #16a34a)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(28px, 5vw, 40px)',
              margin: '0 auto 20px',
              boxShadow: '0 0 0 12px rgba(34,197,94,0.12), 0 8px 24px rgba(34,197,94,0.3)',
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 900,
              marginBottom: '10px',
              letterSpacing: '-0.03em',
            }}
          >
            Order Confirmed! 🎉
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
            Thank you for your purchase! Your order has been placed successfully.
          </p>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '8px',
              padding: '6px 18px',
              fontSize: '0.85rem',
              color: 'var(--success-light)',
              fontWeight: 700,
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '1px',
            }}
          >
            Order #{order._id.slice(-8).toUpperCase()}
          </div>
        </div>

        {/* Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>

          {/* Order Items */}
          <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              📦 Order Items
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        marginBottom: '2px',
                        fontSize: '0.92rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Two Columns: Shipping + Payment */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
              gap: 'clamp(14px, 2vw, 20px)',
            }}
          >
            {/* Shipping */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 22px)' }}>
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: '12px',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                }}
              >
                🏠 Shipping Address
              </h3>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--foreground-2)',
                  lineHeight: 1.8,
                }}
              >
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}<br />
                <span style={{ color: 'var(--text-muted)' }}>📱 {order.shippingAddress.phone}</span>
              </p>
            </div>

            {/* Payment */}
            <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 22px)' }}>
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: '12px',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                }}
              >
                💳 Payment Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Method</span>
                  <span style={{ fontWeight: 500 }}>{order.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <span className={order.isPaid ? 'badge badge-success' : 'badge badge-warning'}>
                    {order.isPaid ? '✓ Paid' : 'Pending'}
                  </span>
                </div>
                {order.paymentResult?.id && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Txn ID</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-geist-mono)' }}>
                      {order.paymentResult.id.slice(-12)}
                    </span>
                  </div>
                )}
                <div className="divider" style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items</span>
                  <span>{formatPrice(order.itemsPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ color: order.shippingPrice === 0 ? 'var(--success-light)' : undefined }}>
                    {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST</span>
                  <span>{formatPrice(order.taxPrice)}</span>
                </div>
                <div className="divider" style={{ margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                  <span>Total Paid</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Progress */}
          <div className="glass-card" style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <h3
              style={{
                fontWeight: 700,
                marginBottom: '20px',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
              }}
            >
              📬 Delivery Status
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: '4px' }}>
              {DELIVERY_STEPS.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '56px' }}>
                      <div
                        style={{
                          width: 'clamp(24px, 4vw, 32px)',
                          height: 'clamp(24px, 4vw, 32px)',
                          borderRadius: '50%',
                          background: isCompleted ? 'var(--success)' : 'var(--surface-2)',
                          border: `2px solid ${isCompleted ? 'var(--success)' : 'var(--border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'clamp(10px, 2vw, 13px)',
                          color: isCompleted ? 'white' : 'var(--text-muted)',
                          fontWeight: 700,
                          transition: 'all 0.3s',
                          boxShadow: isActive ? '0 0 0 4px rgba(34,197,94,0.2)' : 'none',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 'clamp(0.58rem, 1.5vw, 0.68rem)',
                          color: isCompleted ? 'var(--success-light)' : 'var(--text-faint)',
                          textAlign: 'center',
                          maxWidth: '52px',
                          lineHeight: 1.3,
                          fontWeight: isActive ? 700 : 400,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step}
                      </span>
                    </div>
                    {i < DELIVERY_STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: '2px',
                          background: i < currentStep ? 'var(--success)' : 'var(--border)',
                          marginBottom: '22px',
                          transition: 'background 0.3s',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              paddingBottom: '8px',
            }}
          >
            <Link href="/orders" className="btn-secondary" style={{ padding: '13px 28px' }}>
              📦 View All Orders
            </Link>
            <Link href="/products" className="btn-primary" style={{ padding: '13px 28px' }}>
              🛍️ Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
