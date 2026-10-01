'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { ApiResponse, Order } from '@/lib/types';

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
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const fetchOrder = async () => {
      try {
        const { data } = await api.get<ApiResponse<Order>>(`/api/orders/${id}`);
        setOrder(data.data);
      } catch {
        setError('Could not load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, isAuthenticated, router]);

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😕</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Order not found</h2>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '48px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* Success Banner */}
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(99,102,241,0.08) 100%)',
            borderColor: 'rgba(34,197,94,0.3)',
          }}
        >
          {/* Animated checkmark */}
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--success), #16a34a)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 20px',
              boxShadow: '0 0 0 8px rgba(34,197,94,0.15)',
            }}
          >
            ✓
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px' }}>
            Order Confirmed! 🎉
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '12px' }}>
            Thank you for your purchase! Your order has been placed successfully.
          </p>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '8px',
              padding: '6px 18px',
              fontSize: '0.88rem',
              color: '#4ade80',
              fontWeight: 600,
              fontFamily: 'var(--font-geist-mono)',
            }}
          >
            Order ID: #{order._id.slice(-8).toUpperCase()}
          </div>
        </div>

        {/* Order Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Items */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
              📦 Order Items
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      position: 'relative',
                      flexShrink: 0,
                      background: 'var(--surface-2)',
                    }}
                  >
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: '2px' }}>{item.name}</p>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Shipping */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>
                🏠 Shipping Address
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}<br />
                📱 {order.shippingAddress.phone}
              </p>
            </div>

            {/* Payment & Status */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>
                💳 Payment Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Txn ID</span>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-geist-mono)' }}>
                      {order.paymentResult.id.slice(-10)}
                    </span>
                  </div>
                )}
                <div className="divider" style={{ margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items</span>
                  <span>{formatPrice(order.itemsPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ color: order.shippingPrice === 0 ? 'var(--success)' : undefined }}>
                    {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST</span>
                  <span>{formatPrice(order.taxPrice)}</span>
                </div>
                <div className="divider" style={{ margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                  <span>Total Paid</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Status */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '0.95rem' }}>📬 Delivery Status</h3>
            <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
              {['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                const activeSteps = { pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4 };
                const currentStep = activeSteps[order.status as keyof typeof activeSteps] ?? 0;
                const isCompleted = i <= currentStep;
                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isCompleted ? 'var(--success)' : 'var(--surface)',
                          border: `2px solid ${isCompleted ? 'var(--success)' : 'var(--border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: isCompleted ? 'white' : 'var(--text-muted)',
                        }}
                      >
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: isCompleted ? 'var(--success)' : 'var(--text-muted)', textAlign: 'center', maxWidth: '60px' }}>
                        {step}
                      </span>
                    </div>
                    {i < 4 && (
                      <div style={{ flex: 1, height: '2px', background: isCompleted && i < currentStep ? 'var(--success)' : 'var(--border)', marginBottom: '18px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/orders" className="btn-secondary" style={{ padding: '12px 24px' }}>
              📦 View All Orders
            </Link>
            <Link href="/products" className="btn-primary" style={{ padding: '12px 24px' }}>
              🛍️ Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
