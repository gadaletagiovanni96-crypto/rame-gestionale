import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { authApi, usersApi } from '../api/index.js'; import { tokenStore, setUnauthorizedHandler } from '../api/http.js';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const logout = useCallback(() => { tokenStore.clear(); localStorage.removeItem('user'); setUser(null); }, []);
  const login = useCallback(async creds => { const d = await authApi.login(creds); tokenStore.set(d.token); localStorage.setItem('user', JSON.stringify(d.user)); setUser(d.user); }, []);
  useEffect(() => setUnauthorizedHandler(logout), [logout]);
  useEffect(() => {   // il ruolo salvato nel browser può essere vecchio (es. promosso a titolare): lo riallineo all'avvio
    if (!tokenStore.get()) return;
    usersApi.me().then(u => { const fresh = { id: u.id, name: u.name, role: u.role }; localStorage.setItem('user', JSON.stringify(fresh)); setUser(fresh); }).catch(() => {});
  }, []);
  const value = useMemo(() => ({ user, isManager: ['responsabile', 'titolare'].includes(user?.role), isOwner: user?.role === 'titolare', login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
