'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMenuOpen(false);
  };

  const isActive = (path: string) =>
    pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <header
      style={{
        background: 'rgba(15, 15, 19, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '64px', gap: '24px' }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontWeight: 800,
              fontSize: '1.25rem',
              background: 'linear-gradient(135deg, var(--primary-light), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ShopX
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          <Link href="/products" className={isActive('/products')}>
            Products
          </Link>
          {isAuthenticated && (
            <Link href="/orders" className={isActive('/orders')}>
              My Orders
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Cart */}
          <Link
            href="/cart"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              textDecoration: 'none',
              transition: 'all 0.2s',
              fontSize: '18px',
            }}
          >
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
                {user?.name?.split(' ')[0]}
                <span style={{ fontSize: '10px', opacity: 0.6 }}>▼</span>
              </button>

              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '160px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: '8px 12px',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '6px',
                    }}
                  >
                    {user?.email}
                  </div>
                  <Link
                    href="/orders"
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    📦 My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      fontSize: '0.88rem',
                      color: '#f87171',
                    }}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/login" className="btn-ghost" style={{ fontSize: '0.9rem' }}>
                Login
              </Link>
              <Link href="/signup" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
