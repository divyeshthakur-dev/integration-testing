'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/lib/CartContext';
import { queryKeys, fetchProductById } from '@/lib/queries';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

function StarRating({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          style={{ fontSize: `${size}px` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const {
    data: product,
    isLoading: loading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });

  const error = isError
    ? queryError instanceof Error
      ? queryError.message
      : 'Product not found'
    : '';

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/cart');
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
              gap: 'clamp(24px, 4vw, 56px)',
              alignItems: 'start',
            }}
          >
            <div className="skeleton" style={{ paddingTop: '100%', borderRadius: 'var(--radius-lg)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
              <div className="skeleton" style={{ height: '28px', width: '60%' }} />
              <div className="skeleton" style={{ height: '40px', width: '85%' }} />
              <div className="skeleton" style={{ height: '20px', width: '45%' }} />
              <div className="skeleton" style={{ height: '48px', width: '50%' }} />
              <div className="skeleton" style={{ height: '100px' }} />
              <div className="skeleton" style={{ height: '52px' }} />
              <div className="skeleton" style={{ height: '52px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="empty-state">
        <div className="empty-icon">😕</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Product not found</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link href="/products" className="btn-primary" style={{ marginTop: '8px' }}>
          ← Back to Products
        </Link>
      </div>
    );
  }

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const allImages = product.images?.length > 0 ? product.images : [product.image];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{ marginBottom: 'clamp(16px, 3vw, 28px)' }} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/products">Products</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href={`/products?category=${product.category}`}>{product.category}</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
            {product.name}
          </span>
        </nav>

        {/* Product Grid */}
        <div
          className="detail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
            gap: 'clamp(24px, 4vw, 56px)',
            alignItems: 'start',
          }}
        >
          {/* Left: Images */}
          <div>
            {/* Main Image */}
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                aspectRatio: '1 / 1',
                marginBottom: '12px',
              }}
            >
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                unoptimized
                priority
              />
              {discountPct && (
                <span
                  style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    padding: '5px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                  }}
                >
                  -{discountPct}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: `2px solid ${i === selectedImage ? 'var(--primary)' : 'var(--border)'}`,
                      padding: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      background: 'var(--surface)',
                      transition: 'border-color 0.2s',
                      flexShrink: 0,
                    }}
                    aria-label={`View image ${i + 1}`}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill style={{ objectFit: 'cover' }} unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}>
            {/* Tags Row */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{product.category}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{product.brand}</span>
              {product.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <StarRating rating={product.rating} size={17} />
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{product.rating.toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
                flexWrap: 'wrap',
                padding: '16px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="price-original" style={{ fontSize: '1.05rem' }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--success-light)',
                      background: 'rgba(34,197,94,0.1)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {discountPct}% off
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Description
              </h3>
              <p style={{ color: 'var(--foreground-2)', lineHeight: 1.75, fontSize: '0.94rem' }}>
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {product.tags.map((tag) => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Stock Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: product.stock > 0 ? 'var(--success)' : 'var(--error)',
                  boxShadow: product.stock > 0
                    ? '0 0 8px rgba(34,197,94,0.5)'
                    : '0 0 8px rgba(239,68,68,0.5)',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                {product.stock > 0
                  ? product.stock <= 5
                    ? `Only ${product.stock} left in stock!`
                    : `In Stock (${product.stock} available)`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div>
                <label className="input-label" style={{ marginBottom: '10px' }}>Quantity</label>
                <div className="qty-control">
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            {product.stock > 0 ? (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="btn-secondary"
                  style={{
                    flex: '1 1 140px',
                    padding: '15px',
                    fontSize: '0.95rem',
                    borderColor: addedToCart ? 'var(--success)' : undefined,
                    color: addedToCart ? 'var(--success-light)' : undefined,
                    transition: 'all 0.2s',
                  }}
                >
                  {addedToCart ? '✅ Added to Cart!' : '🛒 Add to Cart'}
                </button>
                <button
                  id="buy-now-btn"
                  onClick={handleBuyNow}
                  className="btn-primary"
                  style={{ flex: '1 1 140px', padding: '15px', fontSize: '0.95rem' }}
                >
                  ⚡ Buy Now
                </button>
              </div>
            ) : (
              <button disabled className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed', padding: '15px' }}>
                Out of Stock
              </button>
            )}

            {/* Guarantees */}
            <div className="guarantee-row">
              {[
                { icon: '🚚', text: 'Free Shipping', sub: 'Over ₹1,000' },
                { icon: '↩️', text: 'Easy Returns', sub: '7 day policy' },
                { icon: '🔒', text: 'Secure Pay', sub: 'SSL protected' },
              ].map((item) => (
                <div key={item.text} className="guarantee-item">
                  <div className="guarantee-icon">{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{item.text}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .guarantee-row { grid-template-columns: 1fr !important; }
          .guarantee-item { flex-direction: row; text-align: left; }
        }
      `}</style>
    </div>
  );
}
