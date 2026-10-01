'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { ApiResponse, Order, ShippingAddress } from '@/lib/types';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks supported' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
];

export default function PaymentPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartCount, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);

  // Mock card form state
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (cartCount === 0) { router.push('/cart'); return; }
    const stored = sessionStorage.getItem('checkoutAddress');
    if (!stored) { router.push('/checkout'); return; }
    startTransition(() => setShippingAddress(JSON.parse(stored)));
  }, [isAuthenticated, cartCount, router]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !user) return;

    // Validate UPI
    if (selectedMethod === 'upi' && !upiId.trim()) {
      setError('Please enter your UPI ID');
      return;
    }
    // Validate card fields
    if (selectedMethod === 'card') {
      if (!cardForm.number || !cardForm.expiry || !cardForm.cvv || !cardForm.name) {
        setError('Please fill in all card details');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create order
      const orderPayload = {
        orderItems: cartItems.map(({ product, quantity }) => ({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        })),
        shippingAddress,
        paymentMethod: PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label || selectedMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };

      const { data: orderData } = await api.post<ApiResponse<Order>>('/api/orders', orderPayload);
      const order = orderData.data;

      // 2. Mock payment (simulate delay)
      await new Promise((res) => setTimeout(res, 1500));
      await api.put<ApiResponse<Order>>(`/api/orders/${order._id}/pay`);

      // 3. Clear cart & session data
      clearCart();
      sessionStorage.removeItem('checkoutAddress');

      // 4. Redirect to success
      router.push(`/order-success/${order._id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated || cartCount === 0 || !shippingAddress) return null;

  return (
    <div style={{ padding: '32px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '28px' }}>Payment</h1>

        {/* Progress Steps */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '40px', maxWidth: '500px' }}>
          {['Cart', 'Checkout', 'Payment', 'Done'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: i <= 2 ? 'var(--primary)' : 'var(--surface)',
                    border: '2px solid',
                    borderColor: i <= 2 ? 'var(--primary)' : 'var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: i <= 2 ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {i < 2 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', color: i === 2 ? 'var(--primary-light)' : 'var(--text-muted)', fontWeight: i === 2 ? 600 : 400 }}>
                  {step}
                </span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: '2px', background: i < 2 ? 'var(--primary)' : 'var(--border)', marginBottom: '20px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Left: Payment options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', gridColumn: 'span 2' }}>
            {/* Payment Methods */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px' }}>Select Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    id={`payment-${method.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: selectedMethod === method.id ? 'var(--primary)' : 'var(--border)',
                      background: selectedMethod === method.id ? 'rgba(99,102,241,0.08)' : 'var(--surface)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={() => { setSelectedMethod(method.id); setError(''); }}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '22px' }}>{method.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{method.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic form based on method */}
            {selectedMethod === 'upi' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>📱 Enter UPI ID</h3>
                <input
                  id="upi-id"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="input-field"
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  💡 This is a test environment. No real payment will be made.
                </p>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>💳 Card Details (Test Mode)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Name on Card</label>
                    <input id="card-name" type="text" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} placeholder="John Doe" className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Card Number</label>
                    <input id="card-number" type="text" value={cardForm.number} onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })} placeholder="4242 4242 4242 4242" maxLength={19} className="input-field" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Expiry</label>
                      <input id="card-expiry" type="text" value={cardForm.expiry} onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })} placeholder="MM/YY" maxLength={5} className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>CVV</label>
                      <input id="card-cvv" type="password" value={cardForm.cvv} onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })} placeholder="•••" maxLength={4} className="input-field" />
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      color: 'var(--primary-light)',
                    }}
                  >
                    🔒 Test mode — use 4242 4242 4242 4242 for any amount.
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>🏦 Select Bank</h3>
                <select className="input-field" id="bank-select" defaultValue="">
                  <option value="" disabled>Choose your bank</option>
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  💡 This is a test environment. No real payment will be made.
                </p>
              </div>
            )}

            {selectedMethod === 'cod' && (
              <div className="glass-card" style={{ padding: '24px' }}>
                <div className="alert alert-success">
                  💵 Cash on Delivery selected. You will pay {formatPrice(totalPrice)} when the order arrives.
                </div>
              </div>
            )}

            {/* Shipping info summary */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>📍 Delivering to</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {shippingAddress.fullName} · {shippingAddress.phone}<br />
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
              </p>
              <Link href="/checkout" style={{ fontSize: '0.82rem', color: 'var(--primary-light)', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
                ✏️ Edit Address
              </Link>
            </div>

            {error && (
              <div className="alert alert-error">⚠️ {error}</div>
            )}
          </div>

          {/* Right: Order summary + Place order */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Items */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>Order Items ({cartCount})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cartItems.slice(0, 3).map(({ product, quantity }) => (
                  <div key={product._id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'var(--surface-2)' }}>
                      <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.83rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>× {quantity}</p>
                    </div>
                    <span style={{ fontSize: '0.87rem', fontWeight: 600, flexShrink: 0 }}>{formatPrice(product.price * quantity)}</span>
                  </div>
                ))}
                {cartItems.length > 3 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{cartItems.length - 3} more item(s)</p>
                )}
              </div>
            </div>

            {/* Totals + CTA */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span>{formatPrice(itemsPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ color: shippingPrice === 0 ? 'var(--success)' : undefined }}>
                    {shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (18%)</span>
                  <span>{formatPrice(taxPrice)}</span>
                </div>
              </div>
              <div className="divider" style={{ margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '20px' }}>
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <span className="spinner" style={{ width: '18px', height: '18px' }} />
                    Processing payment...
                  </span>
                ) : (
                  `🔒 Pay ${formatPrice(totalPrice)}`
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                🔐 Secured by 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
