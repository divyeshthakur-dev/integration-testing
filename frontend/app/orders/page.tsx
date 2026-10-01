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

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', label: '⏳ Pending' },
  confirmed: { bg: 'rgba(99,102,241,0.12)', text: 'var(--primary-light)', label: '✓ Confirmed' },
  processing: { bg: 'rgba(20,184,166,0.12)', text: '#2dd4bf', label: '⚙️ Processing' },
  shipped: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', label: '🚚 Shipped' },
  delivered: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', label: '✅ Delivered' },
  cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', label: '✗ Cancelled' },
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
    <div style={{ padding: '32px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>My Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track and manage all your orders</p>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card" style={{ padding: '20px' }}>
                <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '12px' }} />
                <div className="skeleton" style={{ height: '16px', width: '60%', marginBottom: '8px' }} />
                <div className="skeleton" style={{ height: '16px', width: '30%' }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {!loading && orders.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '16px' }}>📦</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>No orders yet</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              You haven&apos;t placed any orders yet.
            </p>
            <Link href="/products" className="btn-primary" style={{ padding: '14px 32px' }}>
              🛍️ Start Shopping
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => {
              const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <div
                  key={order._id}
                  className="glass-card"
                  style={{ padding: '20px', transition: 'border-color 0.2s' }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '0.88rem', fontWeight: 700 }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: statusInfo.bg,
                            color: statusInfo.text,
                            border: `1px solid ${statusInfo.text}40`,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                        {order.isPaid && (
                          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>✓ Paid</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                        Placed on {orderDate}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{formatPrice(order.totalPrice)}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {order.orderItems.reduce((s, i) => s + i.quantity, 0)} item(s)
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    {order.orderItems.slice(0, 2).map((item, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                        <span>•</span>
                        <span>{item.name} × {item.quantity}</span>
                        <span style={{ marginLeft: 'auto' }}>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.orderItems.length > 2 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        +{order.orderItems.length - 2} more
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      📍 {order.shippingAddress.city}, {order.shippingAddress.state}
                    </span>
                    <Link
                      href={`/order-success/${order._id}`}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: '0.85rem' }}
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
