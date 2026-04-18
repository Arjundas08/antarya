import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('antarya_token'));
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const isAuthenticated = !!token && !!shop;

  // Load shop data on mount
  useEffect(() => {
    if (token) {
      api.getMe()
        .then(data => {
          setShop(data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('antarya_token');
          setToken(null);
          setShop(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (newToken, shopData) => {
    localStorage.setItem('antarya_token', newToken);
    setToken(newToken);
    setShop(shopData);
  };

  const logout = () => {
    localStorage.removeItem('antarya_token');
    setToken(null);
    setShop(null);
  };

  const updateShop = (updates) => {
    setShop(prev => ({ ...prev, ...updates }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <StoreContext.Provider value={{
      token,
      shop,
      isAuthenticated,
      loading,
      login,
      logout,
      updateShop,
      showToast
    }}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
