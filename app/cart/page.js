
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../lib/cart';
import { useLocale } from '../../lib/locale';

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

const formatPrice = (value) =>
  Number(value || 0).toLocaleString('id-ID', {
    maximumFractionDigits: 0,
  });

function CartProductImage({ item }) {
  const localImage = item.sku
    ? `/products/${encodeURIComponent(item.sku)}.jpg`
    : null;

  const apiImage = item.image_url
    ? item.image_url.startsWith('http')
      ? item.image_url
      : `${API_URL}${item.image_url.startsWith('/') ? '' : '/'}${item.image_url}`
    : null;

  const sources = [...new Set([localImage, apiImage].filter(Boolean))];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [item.sku, item.image_url]);

  const currentImage = sources[index];

  if (!currentImage) {
    return <div className="cart-image-placeholder">📦</div>;
  }

  return (
    <img
      src={currentImage}
      alt={item.name}
      loading="lazy"
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

export default function CartPage() {
  const { items, removeFromCart, updateQty, totalPrice } = useCart();
  const { t, lang } = useLocale();

  const isId = lang === 'id';

  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );

  const handleQty = (item, nextQty) => {
    const stock = Number(item.stock_kg ?? item.stock ?? Infinity);
    const safeQty = Math.max(1, Math.min(Number(nextQty) || 1, stock));

    updateQty(item.id, safeQty);
  };

  if (items.length === 0) {
    return (
      <main className="sauri-cart-page">
        <div className="cart-empty-premium">
          <div className="empty-cart-icon">🛒</div>

          <span className="cart-eyebrow">SAURI MARKETPLACE</span>

          <h1>
            {isId ? 'Keranjang Anda Kosong' : 'Your Cart Is Empty'}
          </h1>

          <p>
            {isId
              ? 'Temukan produk unggas, ikan segar, petfood, dan nutrisi pilihan dari SAURI.'
              : 'Discover quality poultry, fresh fish, petfood, and animal nutrition products.'}
          </p>

          <Link href="/" className="cart-primary-button">
            {isId ? 'Mulai Belanja' : 'Start Shopping'}
            <span> →</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="sauri-cart-page">
      <div className="cart-page-header">
        <div>
          <span className="cart-eyebrow">SAURI OFFICIAL MARKETPLACE</span>
          <h1>{isId ? 'Keranjang Belanja' : 'Shopping Cart'}</h1>
          <p>
            {isId
              ? 'Periksa kembali produk pilihan Anda sebelum checkout.'
              : 'Review your selected products before checkout.'}
          </p>
        </div>

        <div className="cart-item-count">
          <span>🛒</span>
          <div>
            <strong>{totalItems}</strong>
            <small>{isId ? 'Total item' : 'Total items'}</small>
          </div>
        </div>
      </div>

      <div className="cart-layout">
        <section className="cart-products-panel">
          <div className="cart-panel-heading">
            <h2>{isId ? 'Produk Pilihan' : 'Selected Products'}</h2>
            <span>{items.length} {isId ? 'produk' : 'products'}</span>
          </div>

          <div className="cart-product-list">
            {items.map((item) => {
              const price = Number(item.price_per_kg || 0);
              const qty = Number(item.qty || 0);
              const stock = Number(item.stock_kg ?? item.stock ?? Infinity);
              const subtotal = price * qty;
              const unit = item.unit || 'kg';

              return (
                <article className="cart-product-card" key={item.id}>
                  <Link
                    href={`/product/${item.id}`}
                    className="cart-product-photo"
                    aria-label={`Lihat ${item.name}`}
                  >
                    <CartProductImage item={item} />
                  </Link>

                  <div className="cart-product-main">
                    <div className="cart-product-heading">
                      <div>
                        <span className="cart-product-brand">SAURI</span>
                        <Link href={`/product/${item.id}`}>
                          <h3>{item.name}</h3>
                        </Link>
                        {item.sku && (
                          <small className="cart-product-sku">
                            SKU: {item.sku}
                          </small>
                        )}
                      </div>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={isId ? 'Hapus produk' : 'Remove product'}
                        title={isId ? 'Hapus produk' : 'Remove product'}
                      >
                        <span>✕</span>
                      </button>
                    </div>

                    <div className="cart-product-bottom">
                      <div>
                        <div className="cart-product-unit-price">
                          Rp {formatPrice(price)}
                          <span> / {unit}</span>
                        </div>

                        <div className="cart-stock-label">
                          <span className={stock > 0 ? 'stock-dot' : 'stock-dot stock-dot-empty'} />
                          {stock > 0
                            ? `${isId ? 'Stok tersedia' : 'In stock'}: ${stock} ${unit}`
                            : isId ? 'Stok habis' : 'Out of stock'}
                        </div>
                      </div>

                      <div className="cart-product-controls">
                        <div className="cart-quantity-control">
                          <button
                            type="button"
                            onClick={() => handleQty(item, qty - 1)}
                            disabled={qty <= 1}
                            aria-label="Kurangi jumlah"
                          >
                            −
                          </button>

                          <span>{qty}</span>

                          <button
                            type="button"
                            onClick={() => handleQty(item, qty + 1)}
                            disabled={qty >= stock}
                            aria-label="Tambah jumlah"
                          >
                            +
                          </button>
                        </div>

                        <strong className="cart-line-total">
                          Rp {formatPrice(subtotal)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <Link href="/" className="cart-continue-link">
            <span>←</span>
            {isId ? 'Lanjutkan Belanja' : 'Continue Shopping'}
          </Link>
        </section>

        <aside className="cart-summary-premium">
          <div className="summary-top">
            <span className="cart-eyebrow">SAURI ORDER</span>
            <h2>{isId ? 'Ringkasan Belanja' : 'Order Summary'}</h2>
          </div>

          <div className="summary-line">
            <span>{isId ? 'Jumlah produk' : 'Products'}</span>
            <strong>{items.length}</strong>
          </div>

          <div className="summary-line">
            <span>{isId ? 'Total kuantitas' : 'Total quantity'}</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>{isId ? 'Total belanja' : 'Total amount'}</span>
            <strong>Rp {formatPrice(totalPrice)}</strong>
          </div>

          <p className="summary-note">
            {isId
              ? 'Biaya pengiriman dan ketentuan pembayaran akan ditampilkan pada tahap checkout.'
              : 'Shipping charges and payment details will be shown at checkout.'}
          </p>

          <Link href="/checkout" className="cart-checkout-button">
            {isId ? 'Lanjut ke Checkout' : 'Proceed to Checkout'}
            <span> →</span>
          </Link>

          <div className="cart-secure-note">
            <span>🔒</span>
            {isId ? 'Transaksi melalui SAURI Marketplace' : 'Checkout with SAURI Marketplace'}
          </div>

          <div className="cart-benefit">
            <div>✓</div>
            <span>
              {isId
                ? 'Pilihan produk unggas, ikan, petfood, dan nutrisi.'
                : 'Poultry, seafood, petfood, and nutrition selection.'}
            </span>
          </div>

          <div className="cart-benefit">
            <div>✓</div>
            <span>
              {isId
                ? 'Informasi harga dan stok sesuai data produk.'
                : 'Product prices and stock based on catalog data.'}
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}
