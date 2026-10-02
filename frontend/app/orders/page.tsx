'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending:    { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', border: 'rgba(245,158,11,0.25)',  label: '⏳ Pending' },
  confirmed:  { bg: 'rgba(99,102,241,0.1)',  text: 'var(--primary-light)', border: 'rgba(99,102,241,0.25)', label: '✓ Confirmed' },
  processing: { bg: 'rgba(20,184,166,0.1)', text: '#2dd4bf', border: 'rgba(20,184,166,0.25)', label: '⚙️ Processing' },
  shipped:    { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)', label: '🚚 Shipped' },
  delivered:  { bg: 'rgba(34,197,94,0.1)',  text: '#4ade80', border: 'rgba(34,197,94,0.25)',  label: '✅ Delivered' },
  cancelled:  { bg: 'rgba(239,68,68,0.1)',  text: '#f87171', border: 'rgba(239,68,68,0.25)',  label: '✗ Cancelled' },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    const fetchOrders = async () => {
      try {
        const { data } = await api.get<ApiResponse<Order[]>>('/api/orders/my-orders');
        setOrders(data.data);
      } catch {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Header */}
        <div style={{ marginBottom: 'clamp(20px, 4vw, 36px)' }}>
          <h1 className="section-title">My Orders</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.95rem' }}>
            Track and manage all your orders
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div className="skeleton" style={{ height: '18px', width: '35%' }} />
                    <div className="skeleton" style={{ height: '14px', width: '55%' }} />
                  </div>
                  <div className="skeleton" style={{ height: '24px', width: '80px', borderRadius: '8px' }} />
                </div>
                <div className="skeleton" style={{ height: '14px', width: '75%', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '14px', width: '55%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 700 }}>
              No orders yet
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
              You haven&apos;t placed any orders yet.
            </p>
            <Link href="/products" className="btn-primary" style={{ marginTop: '8px' }}>
              🛍️ Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((order) => {
              const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={order._id}
                  className="glass-card"
                  style={{
                    padding: 'clamp(16px, 2.5vw, 22px)',
                    transition: 'border-color 0.2s, transform 0.2s',
                  }}
                >
                  {/* Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      {/* Order ID + Status */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-geist-mono)',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            color: 'var(--foreground)',
                          }}
                        >
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: statusInfo.bg,
                            color: statusInfo.text,
                            border: `1px solid ${statusInfo.border}`,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {statusInfo.label}
                        </span>
                        {order.isPaid && (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                            ✓ Paid
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Placed {orderDate}
                      </p>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {formatPrice(order.totalPrice)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {order.orderItems.reduce((s, i) => s + i.quantity, 0)} item(s)
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      marginBottom: '14px',
                      padding: '12px',
                      background: 'var(--surface-2)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {order.orderItems.slice(0, 2).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.83rem',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ color: 'var(--primary-light)', fontSize: '0.7rem' }}>●</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                          ×{item.quantity}
                        </span>
                        <span style={{ whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--foreground-2)' }}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.orderItems.length > 2 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '2px', marginLeft: '16px' }}>
                        +{order.orderItems.length - 2} more item{order.orderItems.length - 2 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                    </span>
                    <Link
                      href={`/order-success/${order._id}`}
                      className="btn-secondary"
                      style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
