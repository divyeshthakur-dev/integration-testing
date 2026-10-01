// Home page — redirects to products or shows a hero
import Link from 'next/link';

export default function Home() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)',
          bottom: '-50px',
          right: '-50px',
          pointerEvents: 'none',
        }}
      />

      <div
        className="animate-fade-in"
        style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '0.82rem',
            color: 'var(--primary-light)',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          ✨ Premium Shopping Experience
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '20px',
          }}
        >
          Shop Smarter,{' '}
          <span className="gradient-text">Live Better</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: '40px',
          }}
        >
          Discover thousands of premium products across electronics, fashion,
          and home essentials. Quality guaranteed, delivered fast.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/products" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            🛍️ Shop Now
          </Link>
          <Link href="/signup" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Create Account
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            justifyContent: 'center',
            marginTop: '64px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: '10K+', label: 'Products' },
            { value: '50K+', label: 'Happy Customers' },
            { value: '4.8★', label: 'Average Rating' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
