'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import { Product, ApiResponse } from '@/lib/types';

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
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
        setProduct(data.data);
      } catch {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
      <div style={{ padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="skeleton" style={{ height: '32px', width: '80%' }} />
              <div className="skeleton" style={{ height: '20px', width: '50%' }} />
              <div className="skeleton" style={{ height: '40px', width: '40%' }} />
              <div className="skeleton" style={{ height: '120px' }} />
              <div className="skeleton" style={{ height: '48px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😕</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Product not found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
        <Link href="/products" className="btn-primary">← Back to Products</Link>
      </div>
    );
  }

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const allImages = product.images?.length > 0 ? product.images : [product.image];

  return (
    <div style={{ padding: '32px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Products</Link>
          <span>›</span>
          <Link href={`/products?category=${product.category}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{product.category}</Link>
          <span>›</span>
          <span style={{ color: 'var(--foreground)' }}>{product.name}</span>
        </nav>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'start',
          }}
        >
          {/* Images */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                aspectRatio: '1',
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
                    top: '16px',
                    left: '16px',
                    background: 'var(--error)',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '8px',
                  }}
                >
                  -{discountPct}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: `2px solid ${i === selectedImage ? 'var(--primary)' : 'var(--border)'}`,
                      padding: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      background: 'var(--surface)',
                    }}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill style={{ objectFit: 'cover' }} unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Brand & Category */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="badge badge-primary">{product.category}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{product.brand}</span>
              {product.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
            </div>

            {/* Name */}
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2 }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <StarRating rating={product.rating} />
              <span style={{ fontWeight: 700 }}>{product.rating.toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ({product.numReviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="price-original" style={{ fontSize: '1.1rem' }}>
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="price-discount" style={{ fontSize: '1rem' }}>
                    {discountPct}% off
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Description</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '2px 10px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: product.stock > 0 ? 'var(--success)' : 'var(--error)',
                }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                {product.stock > 0
                  ? product.stock <= 5
                    ? `Only ${product.stock} left in stock!`
                    : `In stock (${product.stock} available)`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Quantity
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--foreground)',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, minWidth: '32px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--foreground)',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
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
                  className={addedToCart ? 'btn-secondary' : 'btn-secondary'}
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    padding: '14px',
                    borderColor: addedToCart ? 'var(--success)' : undefined,
                    color: addedToCart ? '#4ade80' : undefined,
                  }}
                >
                  {addedToCart ? '✅ Added!' : '🛒 Add to Cart'}
                </button>
                <button
                  id="buy-now-btn"
                  onClick={handleBuyNow}
                  className="btn-primary"
                  style={{ flex: 1, minWidth: '140px', padding: '14px' }}
                >
                  ⚡ Buy Now
                </button>
              </div>
            ) : (
              <button disabled className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed', padding: '14px' }}>
                Out of Stock
              </button>
            )}

            {/* Guarantees */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                borderTop: '1px solid var(--border)',
                paddingTop: '16px',
              }}
            >
              {[
                { icon: '🚚', text: 'Free Shipping', sub: 'Over ₹1,000' },
                { icon: '↩️', text: 'Easy Returns', sub: '7 day policy' },
                { icon: '🔒', text: 'Secure Pay', sub: 'SSL protected' },
              ].map((item) => (
                <div key={item.text} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{item.text}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
