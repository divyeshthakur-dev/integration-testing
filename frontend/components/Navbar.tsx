'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMenuOpen(false);
    setMobileOpen(false);
  };

  const isActive = (path: string) =>
    pathname === path ? 'nav-link active' : 'nav-link';

  const navLinks = [
    { href: '/products', label: '🛍️ Products' },
    { href: '/email-test', label: '📧 Email API' },
    ...(isAuthenticated ? [{ href: '/orders', label: '📦 My Orders' }] : []),
  ];

  return (
    <>
      <header
        style={{
          background: scrolled
            ? 'rgba(8, 8, 16, 0.95)'
            : 'rgba(8, 8, 16, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 'var(--nav-height)',
            gap: '8px',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              textDecoration: 'none',
              flexShrink: 0,
              marginRight: '8px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
              }}
            >
              ⚡
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              ShopX
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              flex: 1,
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={isActive(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            {/* Cart Icon */}
            <Link
              href="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                textDecoration: 'none',
                transition: 'all 0.2s',
                fontSize: '18px',
                flexShrink: 0,
              }}
              aria-label={`Cart (${cartCount} items)`}
            >
              🛒
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-7px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--background)',
                    animation: 'scaleIn 0.2s ease',
                  }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth - Desktop only */}
            <div className="desktop-auth">
              {isAuthenticated ? (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px 6px 6px',
                      borderRadius: '10px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
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
                        flexShrink: 0,
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                    <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name?.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '10px', opacity: 0.5, transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                  </button>

                  {menuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '14px',
                        padding: '8px',
                        minWidth: '180px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        zIndex: 100,
                        animation: 'fadeIn 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 12px',
                          borderBottom: '1px solid var(--border)',
                          marginBottom: '6px',
                        }}
                      >
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Signed in as</p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/orders"
                        className="btn-ghost"
                        style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.88rem', borderRadius: '8px' }}
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
                          borderRadius: '8px',
                        }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href="/login" className="btn-ghost" style={{ fontSize: '0.88rem' }}>
                    Login
                  </Link>
                  <Link href="/signup" className="btn-primary" style={{ padding: '9px 18px', fontSize: '0.88rem' }}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="mobile-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'none',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <>
          <div className="mobile-menu">
            {/* User Info */}
            {isAuthenticated && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'var(--surface-2)',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user?.name}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                </div>
              </div>
            )}

            {/* Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mobile-nav-link ${pathname === link.href ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Cart */}
            <Link
              href="/cart"
              className={`mobile-nav-link ${pathname === '/cart' ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              🛒 Cart
              {cartCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '99px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: '#f87171',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                🚪 Sign Out
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <Link href="/login" className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link href="/signup" className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                  🚀 Create Account
                </Link>
              </div>
            )}
          </div>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, top: 'var(--nav-height)', zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
          />
        </>
      )}

      {/* Dropdown Backdrop */}
      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-auth { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}
