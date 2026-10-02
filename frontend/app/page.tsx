// Home page — Hero + Stats
import Link from 'next/link';

export default function Home() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - var(--nav-height))',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 'clamp(400px, 50vw, 700px)',
          height: 'clamp(400px, 50vw, 700px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          top: '-15%',
          left: '-10%',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: 'clamp(300px, 40vw, 500px)',
          height: 'clamp(300px, 40vw, 500px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
          bottom: '-5%',
          right: '-5%',
          pointerEvents: 'none',
        }}
      />

      {/* Hero Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - var(--nav-height))',
          padding: 'clamp(48px, 8vw, 96px) clamp(16px, 4vw, 40px)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className="animate-fade-in"
          style={{ maxWidth: '700px', width: '100%' }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '999px',
              padding: '6px 18px',
              fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
              color: 'var(--primary-light)',
              fontWeight: 600,
              marginBottom: 'clamp(20px, 4vw, 28px)',
              letterSpacing: '0.02em',
            }}
          >
            ✨ Premium Shopping Experience
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 7vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              marginBottom: 'clamp(16px, 3vw, 24px)',
              letterSpacing: '-0.04em',
            }}
          >
            Shop Smarter,{' '}
            <span className="gradient-text">Live Better</span>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
              marginBottom: 'clamp(28px, 5vw, 44px)',
              maxWidth: '560px',
              margin: '0 auto clamp(28px, 5vw, 44px)',
            }}
          >
            Discover thousands of premium products across electronics, fashion,
            and home essentials. Quality guaranteed, delivered fast.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/products"
              className="btn-primary"
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                padding: 'clamp(13px, 2vw, 16px) clamp(24px, 4vw, 36px)',
              }}
            >
              🛍️ Shop Now
            </Link>
            <Link
              href="/signup"
              className="btn-secondary"
              style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                padding: 'clamp(12px, 2vw, 15px) clamp(24px, 4vw, 36px)',
              }}
            >
              Create Account
            </Link>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 'clamp(24px, 5vw, 56px)',
              justifyContent: 'center',
              marginTop: 'clamp(48px, 8vw, 80px)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '10K+', label: 'Products' },
              { value: '50K+', label: 'Happy Customers' },
              { value: '4.8★', label: 'Avg Rating' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                    marginTop: '4px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Pills */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginTop: 'clamp(32px, 5vw, 48px)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { icon: '🚚', text: 'Free Shipping over ₹1,000' },
              { icon: '↩️', text: '7-Day Returns' },
              { icon: '🔒', text: 'Secure Checkout' },
            ].map((item) => (
              <span
                key={item.text}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
