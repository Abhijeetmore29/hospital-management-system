import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.me();
        if (active) {
          setUser(response.user);
        }
      } catch (error) {
        localStorage.removeItem('hms_token');
        setToken(null);
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [token]);

  async function login(email, password) {
    const response = await api.login({ email, password });
    localStorage.setItem('hms_token', response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  async function logout() {
    try {
      await api.logout();
    } catch (error) {
      // Ignore server logout errors and clear local session.
    } finally {
      localStorage.removeItem('hms_token');
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(token && user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

