'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { fetchAPI } from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sauri_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await fetchAPI('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    localStorage.setItem('sauri_user', JSON.stringify(data.user));
    localStorage.setItem('sauri_token', data.token);
    return data.user;
  };

  const register = async (name, email, password, phone) => {
    const data = await fetchAPI('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sauri_user');
    localStorage.removeItem('sauri_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
