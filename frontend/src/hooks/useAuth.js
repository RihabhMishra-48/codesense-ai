import { useCallback } from 'react';
import useAppStore from '../store/appStore';
import { login as apiLogin, register as apiRegister, getMe } from '../services/api';

export function useAuth() {
  const { setUser, setToken, token, logout } = useAppStore();

  const loginFn = useCallback(
    async (email, password) => {
      const res = await apiLogin(email, password);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    },
    [setToken, setUser]
  );

  const registerFn = useCallback(
    async (username, email, password) => {
      const res = await apiRegister(username, email, password);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    },
    [setToken, setUser]
  );

  const restoreSession = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getMe();
      setUser(res.data.user);
    } catch {
      logout();
    }
  }, [token, setUser, logout]);

  return { login: loginFn, register: registerFn, logout, restoreSession };
}
