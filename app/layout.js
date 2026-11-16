'use client';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { CartProvider } from '../lib/cart';
import { LocaleProvider } from '../lib/locale';
import Navbar from '../components/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              {children}
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
