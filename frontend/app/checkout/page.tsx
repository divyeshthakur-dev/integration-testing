'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { ShippingAddress } from '@/lib/types';

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
  const { cartItems, cartCount, itemsPrice, shippingPrice, taxPrice, totalPrice } = useCart();

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (cartCount === 0) {
      router.push('/cart');
      return;
    }
    // Pre-fill fullName once — use a ref guard so it only runs once
    if (user && !prefilled.current) {
      prefilled.current = true;
      setAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [isAuthenticated, cartCount, user, router]);

  const validate = () => {
    const e: Partial<ShippingAddress> = {};
    if (!address.fullName.trim()) e.fullName = 'Full name is required';
    if (!address.address.trim()) e.address = 'Street address is required';
    if (!address.city.trim()) e.city = 'City is required';
    if (!address.state) e.state = 'State is required';
    if (!address.postalCode.trim() || !/^\d{6}$/.test(address.postalCode)) e.postalCode = 'Valid 6-digit PIN is required';
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone)) e.phone = 'Valid 10-digit phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Store shipping address in sessionStorage for the payment page
    sessionStorage.setItem('checkoutAddress', JSON.stringify(address));
    router.push('/payment');
  };

  if (!isAuthenticated || cartCount === 0) return null;

  return (
    <div style={{ padding: '32px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '28px' }}>Checkout</h1>

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
                    background: i <= 1 ? 'var(--primary)' : 'var(--surface)',
                    border: '2px solid',
                    borderColor: i <= 1 ? 'var(--primary)' : 'var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: i <= 1 ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', color: i === 1 ? 'var(--primary-light)' : 'var(--text-muted)', fontWeight: i === 1 ? 600 : 400 }}>
                  {step}
                </span>
              </div>
              {i < 3 && <div style={{ flex: 1, height: '2px', background: i < 1 ? 'var(--primary)' : 'var(--border)', marginBottom: '20px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Shipping Form */}
          <div className="glass-card" style={{ padding: '28px', gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>📦 Shipping Address</h2>
            <form id="checkout-form" onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Full Name *</label>
                  <input id="checkout-name" name="fullName" value={address.fullName} onChange={handleChange} className="input-field" placeholder="John Doe" />
                  {errors.fullName && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.fullName}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Phone Number *</label>
                  <input id="checkout-phone" name="phone" value={address.phone} onChange={handleChange} className="input-field" placeholder="10-digit mobile" maxLength={10} />
                  {errors.phone && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.phone}</p>}
                </div>

                {/* Street */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Street Address *</label>
                  <input id="checkout-address" name="address" value={address.address} onChange={handleChange} className="input-field" placeholder="House no., Street, Area" />
                  {errors.address && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.address}</p>}
                </div>

                {/* City */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>City *</label>
                  <input id="checkout-city" name="city" value={address.city} onChange={handleChange} className="input-field" placeholder="Mumbai" />
                  {errors.city && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.city}</p>}
                </div>

                {/* State */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>State *</label>
                  <select id="checkout-state" name="state" value={address.state} onChange={handleChange} className="input-field">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.state}</p>}
                </div>

                {/* PIN */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>PIN Code *</label>
                  <input id="checkout-pin" name="postalCode" value={address.postalCode} onChange={handleChange} className="input-field" placeholder="400001" maxLength={6} />
                  {errors.postalCode && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '4px' }}>{errors.postalCode}</p>}
                </div>

                {/* Country */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Country</label>
                  <input name="country" value={address.country} className="input-field" readOnly style={{ opacity: 0.7 }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
                <Link href="/cart" className="btn-secondary" style={{ padding: '12px 24px' }}>
                  ← Back to Cart
                </Link>
                <button id="checkout-submit" type="submit" className="btn-primary" style={{ flex: 1, padding: '12px 24px' }}>
                  Continue to Payment →
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Your Order ({cartCount})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {cartItems.map(({ product, quantity }) => (
                <div key={product._id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'var(--surface-2)' }}>
                    <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Qty: {quantity}</p>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, flexShrink: 0 }}>
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="divider" style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
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
            <div className="divider" style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem' }}>
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
