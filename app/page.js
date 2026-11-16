
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from '../lib/locale';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

const categories = [
  { id: 'All', labelId: 'Semua Produk', labelEn: 'All Products', icon: '✦', image: '/cover_hero.png' },
  { id: 'Poultry', labelId: 'Unggas', labelEn: 'Poultry', icon: '🐔', image: '/categories/ayam-potong.jpg' },
  { id: 'Fresh Fish', labelId: 'Ikan Segar', labelEn: 'Fresh Fish', icon: '🐟', image: '/categories/ikan-segar.jpg' },
  { id: 'Fish Processing', labelId: 'Olahan Ikan', labelEn: 'Processed Fish', icon: '🍤', image: '/categories/processed.jpg' },
  { id: 'Petfood', labelId: 'Petfood', labelEn: 'Petfood', icon: '🐾', image: '/categories/pet-food.jpg' },
  { id: 'Animal Oil & Nutrition', labelId: 'Minyak & Nutrisi', labelEn: 'Oil & Nutrition', icon: '🫙', image: '/categories/oil-minyak.jpg' },
];

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('id-ID', {
    maximumFractionDigits: 0,
  });

function ProductImage({ product }) {
  const cloudinaryImage = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : `${API_URL}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`
    : null;

  const localImage = product.sku
    ? `/products/${encodeURIComponent(product.sku)}.jpg`
    : null;

  const sources = [...new Set(
    [cloudinaryImage, localImage].filter(Boolean)
  )];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [product.sku, product.image_url]);

  const currentImage = sources[index];

  if (!currentImage) {
    return (
      <div className="sauri-image-placeholder">
        <span>📦</span>
        <small>SAURI PRODUCT</small>
      </div>
    );
  }

  return (
    <img
      key={currentImage}
      src={currentImage}
      alt={product.name}
      loading="lazy"
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

function ProductSkeleton() {
  return (
    <div className="sauri-skeleton-grid">
      {Array.from({ length: 10 }).map((_, index) => (
        <div className="sauri-skeleton-card" key={index}>
          <div className="sauri-skeleton-image" />
          <div className="sauri-skeleton-line" />
          <div className="sauri-skeleton-line short" />
          <div className="sauri-skeleton-line price" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { t, lang } = useLocale();

  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isID = lang === 'id';

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_URL}/api/products`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid product data');
        }

        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'All') {
      result = result.filter(
        (product) => product.category === activeCategory
      );
    }

    if (search.trim()) {
      const keyword = search.toLowerCase().trim();

      result = result.filter((product) =>
        [
          product.name,
          product.category,
          product.sku,
          product.description,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(keyword)
          )
      );
    }

    return result;
  }, [products, activeCategory, search]);

  const activeCategoryLabel =
    categories.find((cat) => cat.id === activeCategory);

  return (
    <main className="sauri-home">

      {/* HERO */}
      <section className="sauri-hero">
        <div className="sauri-hero-background" />

        <div className="sauri-hero-content">
          <div className="sauri-eyebrow">
            <span className="sauri-live-dot" />
            SAURI OFFICIAL MARKETPLACE
          </div>

          <h1>
            {isID ? 'Kesegaran' : 'Freshness'}
            <br />
            <span>{isID ? 'Pilihan Terbaik.' : 'You Can Trust.'}</span>
          </h1>

          <p>
            {isID
              ? 'Satu tempat untuk kebutuhan unggas, ikan segar, olahan ikan, petfood, serta minyak dan nutrisi hewan.'
              : 'Your destination for poultry, fresh fish, processed seafood, petfood, and animal oil & nutrition.'}
          </p>

          <div className="sauri-hero-actions">
            <Link href="#products" className="sauri-primary-btn">
              {isID ? 'Jelajahi Produk' : 'Explore Products'}
              <span>↗</span>
            </Link>

            <a href="#categories" className="sauri-secondary-btn">
              {isID ? 'Lihat Kategori' : 'Explore Categories'}
            </a>
          </div>

          <div className="sauri-hero-caption">
            <span>FRESH MARKET</span>
            <span className="caption-divider" />
            <span>POULTRY · FISH · PETFOOD</span>
          </div>
        </div>

        <div className="sauri-hero-decoration">
          <div className="sauri-hero-orbit orbit-one" />
          <div className="sauri-hero-orbit orbit-two" />
          <div className="sauri-hero-symbol">S</div>
          <div className="sauri-hero-tag">
            <span>SAURI</span>
            <small>FRESH MARKET</small>
          </div>
        </div>

        <div className="sauri-hero-bottom">
          <span>01 / 05</span>
          <div />
          <span>QUALITY PRODUCT COLLECTION</span>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="sauri-value-strip">
        <div>
          <span className="value-icon">✦</span>
          <span>{isID ? 'Pilihan Produk' : 'Product Selection'}</span>
        </div>
        <div>
          <span className="value-icon">◈</span>
          <span>{isID ? 'Informasi Stok' : 'Stock Information'}</span>
        </div>
        <div>
          <span className="value-icon">▣</span>
          <span>{isID ? 'Katalog Terpadu' : 'Unified Catalog'}</span>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className="sauri-categories">
        <div className="sauri-section-heading">
          <div>
            <span className="sauri-section-kicker">
              DISCOVER SAURI
            </span>
            <h2>
              {isID ? 'Jelajahi Kategori' : 'Explore Categories'}
            </h2>
            <p>
              {isID
                ? 'Temukan berbagai kategori produk pilihan.'
                : 'Explore our range of product categories.'}
            </p>
          </div>
          <span className="sauri-heading-number">01</span>
        </div>

        <div className="sauri-category-grid">
          {categories.map((cat, index) => (
            <button
              type="button"
              key={cat.id}
              className={`sauri-category-card ${
                activeCategory === cat.id ? 'selected' : ''
              }`}
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById('products')?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
              style={{
                backgroundImage: `url("${cat.image}")`,
              }}
              aria-pressed={activeCategory === cat.id}
            >
              <span className="sauri-category-number">
                0{index + 1}
              </span>

              <span className="sauri-category-icon">
                {cat.icon}
              </span>

              <span className="sauri-category-name">
                {isID ? cat.labelId : cat.labelEn}
              </span>

              <span className="sauri-category-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="sauri-products">
        <div className="sauri-section-heading product-heading">
          <div>
            <span className="sauri-section-kicker">
              THE SAURI COLLECTION
            </span>
            <h2>
              {isID ? 'Produk Pilihan' : 'Featured Products'}
            </h2>
            <p>
              {isID
                ? 'Temukan produk sesuai kebutuhan Anda.'
                : 'Find the products that fit your needs.'}
            </p>
          </div>

          <div className="sauri-product-count">
            <strong>{filteredProducts.length}</strong>
            <span>{isID ? 'PRODUK' : 'PRODUCTS'}</span>
          </div>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="sauri-catalog-toolbar">
          <div className="sauri-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder={isID
                ? 'Cari nama produk, kategori, atau SKU...'
                : 'Search products, categories, or SKU...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="sauri-active-filter">
            <span>{isID ? 'Kategori:' : 'Category:'}</span>
            <strong>
              {isID
                ? activeCategoryLabel?.labelId
                : activeCategoryLabel?.labelEn}
            </strong>
          </div>
        </div>

        {loading ? (
          <ProductSkeleton />
        ) : error ? (
          <div className="sauri-state">
            <span>!</span>
            <h3>{isID ? 'Katalog belum tersedia' : 'Catalog unavailable'}</h3>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="sauri-primary-btn"
            >
              {isID ? 'Coba Lagi' : 'Try Again'}
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="sauri-product-grid">
            {filteredProducts.map((product, index) => {
              const stock = Number(product.stock_kg || 0);
              const price = Number(product.price_per_kg || 0);

              const categoryLabel = categories.find(
                (cat) => cat.id === product.category
              );

              return (
                <article
                  key={product.id}
                  className="sauri-product-card"
                  style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="sauri-product-link"
                  >
                    <div className="sauri-product-photo">
                      <ProductImage product={product} />

                      <span className="sauri-product-brand">
                        SAURI
                      </span>

                      {stock <= 0 && (
                        <span className="sauri-out-label">
                          {isID ? 'STOK HABIS' : 'OUT OF STOCK'}
                        </span>
                      )}

                      <span className="sauri-product-open">
                        ↗
                      </span>
                    </div>

                    <div className="sauri-product-content">
                      <div className="sauri-product-category">
                        {isID
                          ? categoryLabel?.labelId || product.category
                          : categoryLabel?.labelEn || product.category}
                      </div>

                      <h3>{product.name}</h3>

                      <div className="sauri-product-sku">
                        {product.sku || 'SAURI PRODUCT'}
                      </div>

                      <div className="sauri-product-price">
                        <strong>Rp {formatPrice(price)}</strong>
                        <span>/ {product.unit || 'kg'}</span>
                      </div>

                      <div className="sauri-product-footer">
                        <span className={stock > 0 ? 'available' : 'unavailable'}>
                          <i />
                          {stock > 0
                            ? (isID ? 'Tersedia' : 'Available')
                            : (isID ? 'Habis' : 'Unavailable')}
                        </span>

                        {stock > 0 && (
                          <span className="sauri-stock-amount">
                            {formatPrice(stock)} {product.unit || 'kg'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="sauri-state">
            <span>⌕</span>
            <h3>
              {isID ? 'Produk tidak ditemukan' : 'No products found'}
            </h3>
            <p>
              {isID
                ? 'Coba kata kunci atau kategori lainnya.'
                : 'Try another keyword or category.'}
            </p>
            <button
              type="button"
              className="sauri-primary-btn"
              onClick={() => {
                setSearch('');
                setActiveCategory('All');
              }}
            >
              {isID ? 'Tampilkan Semua Produk' : 'Show All Products'}
            </button>
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <section className="sauri-bottom-banner">
        <div>
          <span>SAURI · FRESH MARKET</span>
          <h2>
            {isID
              ? 'Satu Tempat. Beragam Kebutuhan.'
              : 'One Destination. Multiple Needs.'}
          </h2>
          <p>
            {isID
              ? 'Jelajahi katalog produk SAURI dan temukan pilihan yang tepat.'
              : 'Explore the SAURI catalog and discover the right products.'}
          </p>
        </div>

        <Link href="#products" className="sauri-bottom-button">
          {isID ? 'Jelajahi Katalog' : 'Explore Catalog'} ↗
        </Link>
      </section>

    </main>
  );
}
