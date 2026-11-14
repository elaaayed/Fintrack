import { createContext, useContext, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Au chargement (ex. rafraîchissement de la page), on retrouve l'utilisateur à partir du token.
  // Si le token est expiré ou invalide, on déconnecte proprement.
  useEffect(() => {
    if (!token || user) return;
    let cancelled = false;
    axiosClient
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        if (!cancelled) logout();
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function login(email, password) {
    const response = await axiosClient.post('/auth/login', { email, password });
    const receivedToken = response.data.token;

    localStorage.setItem('token', receivedToken);
    setToken(receivedToken);

    const meResponse = await axiosClient.get('/auth/me');
    setUser(meResponse.data);
  }

  async function register(data) {
    await axiosClient.post('/auth/register', data);
    await login(data.email, data.password);
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}