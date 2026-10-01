import { Product } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? 'star-filled' : 'star-empty'}
          style={{ fontSize: '14px' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

export default function ProductCard({ product }: { product: Product }) {
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <Link href={`/products/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="product-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div
          style={{
            position: 'relative',
            height: '220px',
            overflow: 'hidden',
            background: 'var(--surface-2)',
          }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
            unoptimized
          />
          {discountPct && (
            <span
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'var(--error)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              -{discountPct}%
            </span>
          )}
          {product.isFeatured && (
            <span
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(99,102,241,0.9)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
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
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              Out of Stock
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
              {product.category}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {product.brand}
            </span>
          </div>

          <h3
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'var(--foreground)',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {product.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              ({product.numReviews})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="price-original">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 500 }}>
              Only {product.stock} left!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
