'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { useLocale } from '../../lib/locale';
import { fetchAPI } from '../../lib/api';

const formatPrice = (v) => Number(v || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { t, lang } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (items.length === 0 && !success) {
    router.push('/cart');
    return null;
  }

  const shipping = 15000;
  const grandTotal = totalPrice + shipping;

  const handleCheckout = async () => {
    if (!user) {
      alert(lang === 'id' ? 'Silakan login terlebih dahulu.' : 'Please login first.');
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      await fetchAPI('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: user.name,
          customer_phone: user.phone || '000',
          customer_email: user.email,
          shipping_addr: 'Alamat Default (Edit di API)',
          notes: 'Pesanan via Web Shop',
          items: items.map((i) => ({ product_id: i.id, qty_kg: i.qty })),
        }),
      });
      clearCart();
      setSuccess(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="empty-cart">
        <h2 style={{ color: 'var(--sauri-charcoal)' }}>{t.orderSuccess}</h2>
        <p style={{ marginBottom: '24px', color: 'var(--sauri-grey)' }}>
          {lang === 'id' ? 'Pesanan Anda sedang diproses oleh tim SAURI.' : 'Your order is being processed by the SAURI team.'}
        </p>
        <button onClick={() => router.push('/')} className="hero-button">{lang === 'id' ? 'Kembali Belanja' : 'Back to Shop'}</button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">{t.checkout}</h1>
      <div className="cart-summary">
        <div className="total-row"><span>{t.subtotal}</span><span>Rp {formatPrice(totalPrice)}</span></div>
        <div className="total-row"><span>{t.shipping}</span><span>Rp {formatPrice(shipping)}</span></div>
        <div className="total-row" style={{ fontSize: '22px', color: 'var(--sauri-red)' }}>
          <span>{t.grandTotal}</span><span>Rp {formatPrice(grandTotal)}</span>
        </div>
        <button onClick={handleCheckout} disabled={loading} className="checkout-btn" style={{ marginTop: '20px' }}>
          {loading ? 'Processing...' : (lang === 'id' ? 'Buat Pesanan' : 'Place Order')}
        </button>
      </div>
    </div>
  );
}
