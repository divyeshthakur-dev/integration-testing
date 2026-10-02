'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { ShippingAddress, ApiResponse, Order } from '@/lib/types';
import api from '@/lib/api';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartCount, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();

  const prefilled = useRef(false);

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<ShippingAddress>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (cartCount === 0) { router.push('/cart'); return; }
    if (user && !prefilled.current) {
      prefilled.current = true;
      setAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [isAuthenticated, cartCount, user, router]);

  const validate = () => {
    const e: Partial<ShippingAddress> = {};
    if (!address.fullName.trim()) e.fullName = 'Required';
    if (!address.address.trim()) e.address = 'Required';
    if (!address.city.trim()) e.city = 'Required';
    if (!address.state) e.state = 'Required';
    if (!address.postalCode.trim() || !/^\d{6}$/.test(address.postalCode))
      e.postalCode = 'Valid 6-digit PIN required';
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone))
      e.phone = 'Valid 10-digit phone required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');

    try {
      const orderPayload = {
        orderItems: cartItems.map(({ product, quantity }) => ({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity,
        })),
        shippingAddress: address,
        paymentMethod: 'Stripe',
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };

      const { data: orderData } = await api.post<ApiResponse<Order>>('/api/orders', orderPayload);
      const order = orderData.data;

      const { data: stripeData } = await api.post<ApiResponse<{ url: string }>>(
        '/api/stripe/create-checkout-session',
        { orderId: order._id }
      );

      clearCart();
      sessionStorage.removeItem('checkoutAddress');
      window.location.href = stripeData.data.url;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setSubmitError(
        errorObj.response?.data?.message || 'Failed to initialize payment. Please try again.'
      );
      setLoading(false);
    }
  };

  if (!isAuthenticated || cartCount === 0) return null;

  const FieldError = ({ name }: { name: keyof ShippingAddress }) =>
    errors[name] ? (
      <p style={{ color: 'var(--error-light)', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        ⚠ {errors[name]}
      </p>
    ) : null;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1080px' }}>
        <div
          className="checkout-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 'clamp(24px, 4vw, 44px)',
            alignItems: 'start',
          }}
        >
          {/* Left: Shipping Form */}
          <div>
            <h1 className="section-title" style={{ marginBottom: '24px' }}>Checkout</h1>

            <form onSubmit={handlePlaceOrder} className="glass-card" style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '20px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🏠 Shipping Details
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Full Name */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" htmlFor="checkout-name">Full Name</label>
                  <input
                    id="checkout-name"
                    name="fullName"
                    value={address.fullName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  <FieldError name="fullName" />
                </div>

                {/* Phone */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" htmlFor="checkout-phone">Phone Number</label>
                  <input
                    id="checkout-phone"
                    name="phone"
                    value={address.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    inputMode="numeric"
                    autoComplete="tel"
                  />
                  <FieldError name="phone" />
                </div>

                {/* Street Address */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" htmlFor="checkout-address">Street Address</label>
                  <input
                    id="checkout-address"
                    name="address"
                    value={address.address}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="House no., Street, Area"
                    autoComplete="street-address"
                  />
                  <FieldError name="address" />
                </div>

                {/* City */}
                <div>
                  <label className="input-label" htmlFor="checkout-city">City</label>
                  <input
                    id="checkout-city"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City"
                    autoComplete="address-level2"
                  />
                  <FieldError name="city" />
                </div>

                {/* PIN Code */}
                <div>
                  <label className="input-label" htmlFor="checkout-pin">PIN Code</label>
                  <input
                    id="checkout-pin"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="6-digit PIN"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />
                  <FieldError name="postalCode" />
                </div>

                {/* State */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" htmlFor="checkout-state">State</label>
                  <select
                    id="checkout-state"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <FieldError name="state" />
                </div>
              </div>

              {submitError && (
                <div className="alert alert-error" style={{ marginTop: '20px' }}>
                  ⚠️ {submitError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1.05rem',
                  marginTop: '28px',
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: '18px', height: '18px' }} />
                    Processing...
                  </>
                ) : (
                  <>🔒 Pay {formatPrice(totalPrice)} with Stripe</>
                )}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                You will be redirected to Stripe&apos;s secure checkout page
              </p>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div
              className="glass-card"
              style={{
                padding: 'clamp(20px, 3vw, 28px)',
                position: 'sticky',
                top: 'calc(var(--nav-height) + 20px)',
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h2>

              {/* Items */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                  marginBottom: '20px',
                }}
              >
                {cartItems.map(({ product, quantity }) => (
                  <div key={product._id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginBottom: '2px',
                        }}
                      >
                        {product.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {quantity}</p>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, flexShrink: 0 }}>
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ margin: '0 0 16px' }} />

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 500 }}>{formatPrice(itemsPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontWeight: 500, color: shippingPrice === 0 ? 'var(--success-light)' : undefined }}>
                    {shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (18%)</span>
                  <span style={{ fontWeight: 500 }}>{formatPrice(taxPrice)}</span>
                </div>
              </div>

              <div className="divider" style={{ margin: '14px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem' }}>
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              {/* Trust Badges */}
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {[
                  { icon: '🔒', text: 'SSL Secured Checkout' },
                  { icon: '🚚', text: 'Free shipping on orders over ₹1,000' },
                  { icon: '↩️', text: '7-day hassle-free returns' },
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
