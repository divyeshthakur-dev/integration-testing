'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { queryKeys, fetchProducts, fetchCategories } from '@/lib/queries';

export default function ProductsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);

  // Categories query — cached for 10 minutes to avoid redundant network roundtrips
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000,
  });

  // Products query — with keepPreviousData for smooth pagination transitions
  const {
    data: productsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: queryKeys.products.list({
      page,
      search: appliedSearch,
      category,
      sort,
    }),
    queryFn: () =>
      fetchProducts({
        page,
        limit: 12,
        search: appliedSearch,
        category,
        sort,
      }),
    placeholderData: keepPreviousData,
  });

  const products = productsData?.products ?? [];
  const totalPages = productsData?.pages ?? 1;
  const total = productsData?.total ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setCategory('all');
    setSort('default');
    setPage(1);
  };

  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : 'Failed to load products. Make sure the backend is running.'
    : '';

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
            <h1 className="section-title">All Products</h1>
            {!isLoading && (
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
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
            onChange={(e) => handleSortChange(e.target.value)}
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
        {errorMessage && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
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
        {!isLoading && products.length > 0 && (
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
        {!isLoading && products.length === 0 && !errorMessage && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No products found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '320px' }}>
              Try adjusting your search or category filter
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-secondary"
              style={{ marginTop: '8px' }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
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
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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
