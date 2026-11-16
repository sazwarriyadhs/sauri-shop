'use client';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { useLocale } from '../lib/locale';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { lang, toggleLang, t } = useLocale();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="nav-logo">
          <img src="/branding/sauri-logo.png" alt="SAURI" />
        </Link>
        <div className="nav-links">
          <Link href="/">{t.home}</Link>
          <Link href="/#products">{t.products}</Link>
          <Link href="/cart" className="nav-cart">🛒 {t.cart} {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}</Link>
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>
              <button onClick={logout} className="nav-btn">{t.logout}</button>
            </>
          ) : (
            <Link href="/login" className="nav-btn">{t.login}</Link>
          )}
          <button onClick={toggleLang} className="nav-lang">{lang.toUpperCase()}</button>
        </div>
      </div>
    </header>
  );
}
