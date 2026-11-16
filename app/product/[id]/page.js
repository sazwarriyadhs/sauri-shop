
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../lib/cart';
import { useLocale } from '../../../lib/locale';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('id-ID', {
    maximumFractionDigits: 0,
  });

function ProductImage({ product }) {
  const [imageIndex, setImageIndex] = useState(0);

  const images = [
    product?.image_url
      ? product.image_url.startsWith('http')
        ? product.image_url
        : `${API_URL}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`
      : null,
    product?.sku ? `/products/${product.sku}.jpg` : null,
  ].filter(Boolean);

  useEffect(() => {
    setImageIndex(0);
  }, [product?.sku, product?.image_url]);

  const currentImage = images[imageIndex];

  if (!currentImage) {
    return (
      <div className="placeholder-img">
        <span>📦</span>
        <small>Gambar produk belum tersedia</small>
      </div>
    );
  }

  return (
    <img
      key={currentImage}
      src={currentImage}
      alt={product?.name || 'SAURI Product'}
      onError={() => setImageIndex((current) => current + 1)}
    />
  );
}

export default function ProductDetail({ params }) {
  const { addToCart } = useCart();
  const { t, lang } = useLocale();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_URL}/api/products/${params.id}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data = await response.json();

        if (!cancelled) {
          setProduct(data);
        }
      } catch {
        if (!cancelled) {
          setError(
            lang === 'id'
              ? 'Gagal memuat produk. Periksa koneksi server.'
              : 'Failed to load product.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [params.id, lang]);

  if (loading) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <p>{error || 'Produk tidak ditemukan.'}</p>
        <Link href="/">← Kembali ke Beranda</Link>
      </div>
    );
  }

  const stock = Number(product.stock_kg || 0);
  const quantity = Number(qty);
  const invalidQty =
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > stock;

  const handleAdd = () => {
    if (invalidQty) {
      alert(
        lang === 'id'
          ? 'Jumlah tidak valid atau melebihi stok.'
          : 'Invalid quantity or insufficient stock.'
      );
      return;
    }

    addToCart({ ...product, qty: quantity });

    alert(
      lang === 'id'
        ? `${product.name} dimasukkan ke keranjang.`
        : `${product.name} added to cart.`
    );

    router.push('/cart');
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-image">
        <ProductImage product={product} />
      </div>

      <div className="product-detail-info">
        <Link href="/" className="back-link">
          ← {lang === 'id' ? 'Kembali' : 'Back'}
        </Link>

        <span className="detail-badge">
          {product.category}
        </span>

        <h1>{product.name}</h1>

        <p className="detail-sku">
          SKU: {product.sku}
        </p>

        <div className="detail-price">
          Rp {formatPrice(product.price_per_kg)}
          <span> / {product.unit}</span>
        </div>

        <p className="detail-stock">
          {lang === 'id' ? 'Stok' : 'Stock'}:
          {' '}
          <strong>
            {formatPrice(stock)} {product.unit}
          </strong>
        </p>

        <div className="qty-selector">
          <label htmlFor="product-qty">{t.qty}:</label>
          <input
            id="product-qty"
            type="number"
            min="1"
            max={stock}
            step="1"
            value={qty}
            onChange={(e) => {
              const value = e.target.value;
              setQty(value === '' ? '' : Number(value));
            }}
          />
        </div>

        <button
          className="add-to-cart-btn"
          onClick={handleAdd}
          disabled={stock <= 0 || invalidQty}
        >
          {stock <= 0
            ? (lang === 'id' ? 'Stok Habis' : 'Out of Stock')
            : t.addToCart}
        </button>
      </div>
    </div>
  );
}
