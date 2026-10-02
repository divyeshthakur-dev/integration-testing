'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'rgba(8, 8, 16, 0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="container">
        {/* Main Footer */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
            gap: 'clamp(24px, 4vw, 40px)',
            padding: 'clamp(32px, 5vw, 52px) 0 clamp(24px, 4vw, 36px)',
          }}
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                ⚡
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}
              >
                ShopX
              </span>
            </Link>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '200px' }}>
              Premium e-commerce. Quality products, fast delivery, and a seamless shopping experience.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Shop
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { href: '/products', label: 'All Products' },
                { href: '/products?category=Electronics', label: 'Electronics' },
                { href: '/products?category=Clothing', label: 'Clothing' },
                { href: '/cart', label: 'My Cart' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Account
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { href: '/login', label: 'Sign In' },
                { href: '/signup', label: 'Create Account' },
                { href: '/orders', label: 'My Orders' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Trust
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { icon: '🔒', text: 'SSL Secured' },
                { icon: '🚚', text: 'Fast Delivery' },
                { icon: '↩️', text: '7-Day Returns' },
                { icon: '💬', text: '24/7 Support' },
              ].map((item) => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: 'clamp(14px, 2.5vw, 20px) 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            © {year} ShopX. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy Policy', 'Terms of Use'].map((item) => (
              <span key={item} style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
