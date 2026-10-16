import { useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "./AuthContext";
import { getUnreadCount } from "../api/notifications";

const Context = createContext({ unreadCount: null, refresh: () => {} });
export function NotificationProvider({ children }) {
  useCleanMateUi();
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState({ userId: null, count: null });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    if (!userId) return;
    let active = true, pending = false;
    const load = async () => {
      if (pending || AppState.currentState !== "active") return;
      pending = true;
      try {
        const result = await getUnreadCount();
        if (active) setState({ userId, count: result.unreadCount });
      } catch { /* Retry when active; the inbox shows actionable errors. */ }
      finally { pending = false; }
    };
    load();
    const timer = setInterval(load, 30000);
    const subscription = AppState.addEventListener("change", load);
    return () => { active = false; clearInterval(timer); subscription.remove(); };
  }, [userId, revision]);
  return <Context.Provider value={{ unreadCount: state.userId === userId ? state.count : null, refresh }}>{children}</Context.Provider>;
}
export const useNotifications = () => useContext(Context);
