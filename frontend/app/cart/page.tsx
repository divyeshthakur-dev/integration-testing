'use client';

import { useCart } from '@/lib/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount, itemsPrice, shippingPrice, taxPrice, totalPrice } = useCart();
  const router = useRouter();

  if (cartCount === 0) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '5rem' }}>🛒</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)' }}>Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="btn-primary" style={{ marginTop: '8px', padding: '14px 32px' }}>
          🛍️ Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            Shopping Cart <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 400 }}>({cartCount} items)</span>
          </h1>
          <button onClick={clearCart} className="btn-ghost" style={{ color: '#f87171' }}>
            🗑️ Clear Cart
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 2' }}>
            {cartItems.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="glass-card"
                style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}
              >
                {/* Image */}
                <Link href={`/products/${product._id}`} style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'var(--surface-2)',
                    }}
                  >
                    <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} unoptimized />
                  </div>
                </Link>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Link href={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--foreground)' }}>{product.name}</h3>
                  </Link>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {product.brand} · {product.category}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', cursor: 'pointer', fontSize: '16px' }}
                      >
                        −
                      </button>
                      <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        style={{ width: '30px', height: '30px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--foreground)', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer', fontSize: '16px', opacity: quantity >= product.stock ? 0.4 : 1 }}
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="btn-ghost"
                      style={{ color: '#f87171', padding: '4px 8px', fontSize: '0.82rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    {formatPrice(product.price * quantity)}
                  </div>
                  {quantity > 1 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatPrice(product.price)} each
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="glass-card" style={{ padding: '24px', position: 'sticky', top: '80px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Order Summary</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Subtotal', value: formatPrice(itemsPrice) },
                {
                  label: 'Shipping',
                  value: shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice),
                  note: shippingPrice === 0 ? '(Over ₹1,000)' : '(Under ₹1,000)',
                  green: shippingPrice === 0,
                },
                { label: 'GST (18%)', value: formatPrice(taxPrice) },
              ].map((row) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {row.label}
                    {row.note && <span style={{ fontSize: '0.78rem', marginLeft: '4px' }}>{row.note}</span>}
                  </span>
                  <span style={{ fontWeight: 600, color: row.green ? 'var(--success)' : undefined }}>
                    {row.value}
                  </span>
                </div>
              ))}

              <div className="divider" style={{ margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              id="checkout-btn"
              onClick={() => router.push('/checkout')}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Proceed to Checkout →
            </button>

            <Link href="/products" style={{ display: 'block', textAlign: 'center', marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
