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
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = useCart();
  const router = useRouter();

  if (cartCount === 0) {
    return (
      <div className="empty-state" style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
        <div className="empty-icon">🛒</div>
        <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.75rem)', fontWeight: 800 }}>
          Your cart is empty
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '300px' }}>
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/products" className="btn-primary" style={{ marginTop: '8px' }}>
          🛍️ Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Page Header */}
        <div
          style={{
            marginBottom: 'clamp(20px, 3vw, 32px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h1 className="section-title">Shopping Cart</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
              {cartCount} item{cartCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="btn-ghost"
            style={{ color: 'var(--error-light)', fontSize: '0.88rem' }}
          >
            🗑️ Clear Cart
          </button>
        </div>

        {/* Two-Column Layout */}
        <div
          className="cart-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 'clamp(20px, 3vw, 36px)',
            alignItems: 'start',
          }}
        >
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cartItems.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="glass-card"
                style={{
                  padding: 'clamp(14px, 2vw, 20px)',
                  display: 'flex',
                  gap: 'clamp(12px, 2vw, 18px)',
                  alignItems: 'flex-start',
                }}
              >
                {/* Product Image */}
                <Link href={`/products/${product._id}`} style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: 'clamp(80px, 12vw, 108px)',
                      height: 'clamp(80px, 12vw, 108px)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                      unoptimized
                    />
                  </div>
                </Link>

                {/* Product Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Link href={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                    <h3
                      style={{
                        fontWeight: 600,
                        fontSize: 'clamp(0.88rem, 2vw, 1rem)',
                        color: 'var(--foreground)',
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {product.name}
                    </h3>
                  </Link>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {product.brand} · {product.category}
                  </p>

                  {/* Controls Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '6px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(product._id, quantity - 1)}
                        disabled={quantity <= 1}
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <span className="qty-value">{quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(product._id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product._id)}
                      className="btn-ghost"
                      style={{ color: 'var(--error-light)', padding: '6px 10px', fontSize: '0.82rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {formatPrice(product.price * quantity)}
                  </div>
                  {quantity > 1 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatPrice(product.price)} each
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div
            className="glass-card"
            style={{
              padding: 'clamp(20px, 3vw, 28px)',
              position: 'sticky',
              top: 'calc(var(--nav-height) + 20px)',
            }}
          >
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
              Order Summary
            </h2>

            {/* Price Breakdown */}
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
                <div
                  key={row.label}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    {row.label}
                    {row.note && (
                      <span style={{ fontSize: '0.75rem', marginLeft: '4px', opacity: 0.7 }}>
                        {row.note}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: row.green ? 'var(--success-light)' : 'var(--foreground)',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              <div className="divider" style={{ margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="checkout-btn"
              onClick={() => router.push('/checkout')}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: '1rem' }}
            >
              Proceed to Checkout →
            </button>

            <Link
              href="/products"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '14px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              ← Continue Shopping
            </Link>

            {/* Trust Signals */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              {['🔒 SSL', '📦 Fast Ship', '↩️ Returns'].map((item) => (
                <span key={item} style={{ fontSize: '0.72rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
