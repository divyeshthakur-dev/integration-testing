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
    <div style={{ padding: '32px 0', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            All Products
            {!loading && (
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '12px' }}>
                ({total} items)
              </span>
            )}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Discover our curated collection of premium products</p>
        </div>

        {/* Search + Sort */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
            <input
              id="products-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
              🔍 Search
            </button>
          </form>

          <select
            id="products-sort"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field"
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="default">Sort: Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {['all', ...categories].map((cat) => (
            <button
              key={cat}
              id={`category-${cat}`}
              onClick={() => handleCategoryChange(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: category === cat ? 'var(--primary)' : 'var(--border)',
                background: category === cat ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: category === cat ? 'var(--primary-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
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

        {/* Loading skeleton */}
        {loading && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: '220px' }} />
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton" style={{ height: '16px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '20px', width: '90%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '24px', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products grid */}
        {!loading && products.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: 'var(--foreground)' }}>
              No products found
            </h3>
            <p>Try adjusting your search or category filter</p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); setPage(1); }}
              className="btn-secondary"
              style={{ marginTop: '20px' }}
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
              gap: '8px',
              marginTop: '40px',
            }}
          >
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: p === page ? 'var(--primary)' : 'var(--border)',
                  background: p === page ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: p === page ? 'var(--primary-light)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: p === page ? 700 : 400,
                  fontSize: '0.9rem',
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
