'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { useLocale } from '../../lib/locale';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { t, lang } = useLocale();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const user = await login(form.email, form.password);
        if (user.role === 'admin') {
          setError(lang === 'id' ? 'Akun Admin tidak bisa login di sini. Gunakan Aplikasi Mobile.' : 'Admin account cannot login here. Use Mobile App.');
          setLoading(false);
          return;
        }
        router.push('/');
      } else {
        await register(form.name, form.email, form.password, form.phone);
        alert(lang === 'id' ? 'Registrasi sukses! Silakan login.' : 'Registration success! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? t.loginTitle : t.registerTitle}</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>{t.name}</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          )}
          <div className="form-group">
            <label>{t.email}</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>{t.password}</label>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>{t.phone}</label>
              <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          )}
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Loading...' : (isLogin ? t.btnLogin : t.btnRegister)}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? t.noAccount : t.hasAccount}
          <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? t.register : t.login}</button>
        </div>
      </div>
    </div>
  );
}
