'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Product, ApiResponse, ProductsResponse } from '@/lib/types';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      if (sort !== 'default') params.sort = sort;

      const { data } = await api.get<ApiResponse<ProductsResponse>>('/api/products', { params });
      setProducts(data.data.products);
      setTotalPages(data.data.pages);
      setTotal(data.data.total);
    } catch {
      setError('Failed to load products. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<ApiResponse<string[]>>('/api/products/categories');
        setCategories(data.data);
      } catch {
        // silent
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchProducts();
    })();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div
          style={{
            marginBottom: 'clamp(20px, 4vw, 36px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="section-title">
              All Products
            </h1>
            {!loading && (
              <span
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                  fontWeight: 400,
                }}
              >
                {total} items
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Discover our curated collection of premium products
          </p>
          <div style={{ marginTop: '8px' }}>
            <button
              onClick={async () => {
                try {
                  const { startRegistration } = await import('@simplewebauthn/browser');
                  const resp = await api.get('/api/auth/passkey/register-options');
                  const options = resp.data.data;
                  const attResp = await startRegistration({ optionsJSON: options });
                  const verificationResp = await api.post('/api/auth/passkey/register-verify', attResp);
                  if (verificationResp.data.success) {
                    alert('Passkey registered successfully!');
                  }
                } catch (err: unknown) {
                  const axErr = err as { response?: { data?: { message?: string } }; message?: string };
                  alert(axErr.response?.data?.message || axErr.message || 'Passkey registration failed');
                }
              }}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              🔐 Register Passkey (Fingerprint / FaceID)
            </button>
          </div>
        </div>

        {/* Search + Sort Row */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'stretch',
          }}
        >
          {/* Search */}
          <form
            onSubmit={handleSearch}
            style={{ flex: '1 1 220px', minWidth: '220px', display: 'flex' }}
          >
            <div className="search-bar" style={{ flex: 1 }}>
              <input
                id="products-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
              />
              <button type="submit">🔍 Search</button>
            </div>
          </form>

          {/* Sort */}
          <select
            id="products-sort"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field"
            style={{ width: 'auto', minWidth: '170px', flex: '0 1 auto' }}
          >
            <option value="default">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Category Filters */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: 'clamp(20px, 3vw, 32px)',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              id={`category-${cat}`}
              onClick={() => handleCategoryChange(cat)}
              className={`filter-pill ${category === cat ? 'active' : ''}`}
            >
              {cat === 'all' ? '🏪 All' : cat}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
              gap: 'clamp(14px, 2vw, 24px)',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                }}
              >
                <div className="skeleton" style={{ paddingTop: '75%' }} />
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton" style={{ height: '14px', width: '50%' }} />
                  <div className="skeleton" style={{ height: '18px', width: '85%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '65%' }} />
                  <div className="skeleton" style={{ height: '22px', width: '45%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
              gap: 'clamp(14px, 2vw, 24px)',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '320px' }}>
              Try adjusting your search or category filter
            </p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); setPage(1); }}
              className="btn-secondary"
              style={{ marginTop: '8px' }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              marginTop: 'clamp(32px, 5vw, 52px)',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary page-btn"
              style={{ padding: '0 16px', width: 'auto' }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`page-btn ${p === page ? 'active' : ''}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn-secondary page-btn"
              style={{ padding: '0 16px', width: 'auto' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
