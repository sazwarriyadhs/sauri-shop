'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const LocaleContext = createContext();

const dict = {
  id: {
    home: 'Beranda', products: 'Produk', cart: 'Keranjang', login: 'Masuk', logout: 'Keluar',
    register: 'Daftar', search: 'Cari...', checkout: 'Checkout', total: 'Total',
    addToCart: 'Tambah ke Keranjang', price: 'Harga', qty: 'Jumlah', subtotal: 'Subtotal',
    shipping: 'Ongkir', grandTotal: 'Total Akhir', emptyCart: 'Keranjang Kosong',
    loginTitle: 'Masuk ke SAURI', registerTitle: 'Daftar Akun SAURI',
    name: 'Nama Lengkap', email: 'Email', password: 'Password', phone: 'No. HP',
    btnLogin: 'MASUK', btnRegister: 'DAFTAR', noAccount: 'Belum punya akun?',
    hasAccount: 'Sudah punya akun?', orderSuccess: 'Pesanan berhasil!',
  },
  en: {
    home: 'Home', products: 'Products', cart: 'Cart', login: 'Login', logout: 'Logout',
    register: 'Register', search: 'Search...', checkout: 'Checkout', total: 'Total',
    addToCart: 'Add to Cart', price: 'Price', qty: 'Qty', subtotal: 'Subtotal',
    shipping: 'Shipping', grandTotal: 'Grand Total', emptyCart: 'Cart is Empty',
    loginTitle: 'Sign in to SAURI', registerTitle: 'Create SAURI Account',
    name: 'Full Name', email: 'Email', password: 'Password', phone: 'Phone',
    btnLogin: 'LOGIN', btnRegister: 'REGISTER', noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?', orderSuccess: 'Order Success!',
  }
};

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState('id');

  useEffect(() => {
    const saved = localStorage.getItem('sauri_lang');
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('sauri_lang', newLang);
  };

  return (
    <LocaleContext.Provider value={{ lang, toggleLang, t: dict[lang] }}>
      {children}
    </LocaleContext.Provider>
  );
}
export const useLocale = () => useContext(LocaleContext);
