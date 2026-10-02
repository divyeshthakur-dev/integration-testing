import { Product } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          style={{ fontSize: '13px' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductCard({ product }: { product: Product }) {
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <Link href={`/products/${product._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className="product-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image Container */}
        <div
          style={{
            position: 'relative',
            paddingTop: '75%',  /* 4:3 aspect ratio */
            overflow: 'hidden',
            background: 'var(--surface-2)',
            flexShrink: 0,
          }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            unoptimized
          />

          {/* Overlays */}
          {discountPct && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '4px 9px',
                borderRadius: '6px',
                letterSpacing: '0.02em',
                boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
              }}
            >
              -{discountPct}%
            </span>
          )}
          {product.isFeatured && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(99,102,241,0.9)',
                color: 'white',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '4px 9px',
                borderRadius: '6px',
                backdropFilter: 'blur(4px)',
              }}
            >
              ⭐ Featured
            </span>
          )}
          {product.stock === 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {/* Category + Brand */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
              {product.category}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-faint)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '80px',
              }}
            >
              {product.brand}
            </span>
          </div>

          {/* Name */}
          <h3
            style={{
              fontWeight: 600,
              fontSize: '0.92rem',
              color: 'var(--foreground)',
              lineHeight: 1.35,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {product.rating.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
              ({product.numReviews})
            </span>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="price-original">{formatPrice(product.originalPrice)}</span>
            )}
            {discountPct && (
              <span className="price-discount">{discountPct}% off</span>
            )}
          </div>

          {/* Low stock warning */}
          {product.stock > 0 && product.stock <= 5 && (
            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--accent)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🔥 Only {product.stock} left!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
