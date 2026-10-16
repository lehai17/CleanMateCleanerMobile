import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, TOKEN_KEY } from "../api/axios";
import { meApi } from "../api/auth";

const Ctx = createContext(undefined);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState("");
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync("cleanmate_cleaner_user");
    setToken(null);
    setUser(null);
  };
  const refreshUser = async (currentUser) => {
    await SecureStore.setItemAsync("cleanmate_cleaner_user", JSON.stringify(currentUser));
    setUser(currentUser);
  };
  const login = async (currentUser, accessToken) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await refreshUser(currentUser);
    setToken(accessToken);
  };
  const restore = async () => {
    setLoading(true);
    setRestoreError("");
    try {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!accessToken) return;
      const currentUser = await meApi();
      if (!["Customer", "Cleaner"].includes(currentUser.role)) { await logout(); return; }
      await refreshUser(currentUser);
      setToken(accessToken);
    } catch (error) {
      if (error?.response?.status === 401) await logout();
      else setRestoreError("Không thể kết nối để kiểm tra tài khoản. Vui lòng thử lại.");
    } finally { setLoading(false); }
  };
  useEffect(() => { restore(); }, []);
  useEffect(() => {
    const id = api.interceptors.response.use(response => response, error => {
      if (token && error?.response?.status === 401) logout();
      return Promise.reject(error);
    });
    return () => api.interceptors.response.eject(id);
  }, [token]);
  const value = useMemo(() => ({ user, token, login, logout, restore, refreshUser, loading, restoreError }), [user, token, loading, restoreError]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
