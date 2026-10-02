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
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (cartCount === 0) {
      router.push('/cart');
      return;
    }
    // Pre-fill fullName once
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
    if (!address.postalCode.trim() || !/^\d{6}$/.test(address.postalCode)) e.postalCode = 'Valid 6-digit PIN required';
    if (!address.phone.trim() || !/^\d{10}$/.test(address.phone)) e.phone = 'Valid 10-digit phone required';
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
        paymentMethod: 'Stripe', // Only support Stripe now for streamlined flow
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      };

      // 1. Create order
      const { data: orderData } = await api.post<ApiResponse<Order>>('/api/orders', orderPayload);
      const order = orderData.data;

      // 2. Stripe Checkout session
      const { data: stripeData } = await api.post<ApiResponse<{ url: string }>>(
        '/api/stripe/create-checkout-session',
        { orderId: order._id }
      );

      // Clear cart
      clearCart();
      sessionStorage.removeItem('checkoutAddress');

      // Redirect to Stripe
      window.location.href = stripeData.data.url;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setSubmitError(errorObj.response?.data?.message || 'Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated || cartCount === 0) return null;

  return (
    <div style={{ background: 'var(--background)', minHeight: 'calc(100vh - 64px)', padding: '40px 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          
          {/* Left Column: Form */}
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '24px' }}>Checkout</h1>
            
            <form onSubmit={handlePlaceOrder} className="glass-card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Shipping Details</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Full Name</label>
                  <input name="fullName" value={address.fullName} onChange={handleChange} className="input-field" />
                  {errors.fullName && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.fullName}</p>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Phone Number</label>
                  <input name="phone" value={address.phone} onChange={handleChange} className="input-field" maxLength={10} />
                  {errors.phone && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.phone}</p>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Street Address</label>
                  <input name="address" value={address.address} onChange={handleChange} className="input-field" />
                  {errors.address && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.address}</p>}
                </div>

                <div>
                  <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>City</label>
                  <input name="city" value={address.city} onChange={handleChange} className="input-field" />
                  {errors.city && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.city}</p>}
                </div>

                <div>
                  <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>PIN Code</label>
                  <input name="postalCode" value={address.postalCode} onChange={handleChange} className="input-field" maxLength={6} />
                  {errors.postalCode && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.postalCode}</p>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>State</label>
                  <select name="state" value={address.state} onChange={handleChange} className="input-field">
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.state && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '4px' }}>{errors.state}</p>}
                </div>
              </div>

              {submitError && (
                <div className="alert alert-error" style={{ marginTop: '20px' }}>
                  {submitError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
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
                You will be redirected to Stripe&apos;s secure checkout.
              </p>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <div className="glass-card" style={{ padding: '32px', position: 'sticky', top: '24px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '24px' }}>Order Summary</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                {cartItems.map(({ product, quantity }) => (
                  <div key={product._id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'var(--surface-2)' }}>
                      <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} unoptimized />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{product.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {quantity}</p>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, flexShrink: 0 }}>
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ margin: '24px 0' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 500 }}>{formatPrice(itemsPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                  <span style={{ fontWeight: 500, color: shippingPrice === 0 ? 'var(--success)' : undefined }}>
                    {shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GST (18%)</span>
                  <span style={{ fontWeight: 500 }}>{formatPrice(taxPrice)}</span>
                </div>
              </div>
              
              <div className="divider" style={{ margin: '16px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem' }}>
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
