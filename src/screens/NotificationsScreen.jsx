import { Raw, useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import { useCallback, useRef, useState } from "react";
import { Alert, Button, FlatList, Text, View } from './../ui/Preferences';
import { useFocusEffect } from "@react-navigation/native";
import { getNotifications, readNotification, readAllNotifications } from "../api/notifications";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

export default function NotificationsScreen({ navigation }) {
  useCleanMateUi();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const { refresh } = useNotifications();
  const { user } = useAuth();
  const load = useCallback(async beforeId => {
    if (pending.current) return;
    pending.current = true; setLoading(true); setError("");
    try {
      const data = await getNotifications(beforeId);
      setItems(current => beforeId ? [...current, ...data.items.filter(item => !current.some(old => old.id === item.id))] : data.items);
      setUnreadCount(data.unreadCount); setCursor(data.nextBeforeId);
    } catch { setError("Không thể tải thông báo. Vui lòng thử lại."); }
    finally { pending.current = false; setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); refresh(); }, [load, refresh]));
  const mark = async item => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const result = item ? await readNotification(item.id) : await readAllNotifications(items[0].id);
      setItems(current => current.map(n => !n.readAt && (!item || n.id === item.id) ? { ...n, readAt: result.readAt } : n));
      setUnreadCount(result.unreadCount); refresh();
    } catch { setError("Không thể đánh dấu đã đọc. Vui lòng thử lại."); }
    finally { pending.current = false; setBusy(false); }
  };
  return <View style={{ flex: 1, padding: 16 }}>
    <Text style={{ fontSize: 22, fontWeight: "700" }}>Thông báo</Text>
    {unreadCount !== null && <Text>Chưa đọc: {unreadCount}</Text>}
    <Button title="Tải lại thông báo" disabled={loading || busy} onPress={() => { load(); refresh(); }} />
    <Button title="Đánh dấu tất cả đã đọc" disabled={loading || busy || !items.length || !unreadCount} onPress={() => mark(null)} />
    {error ? <Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{error}</Text> : null}
    {loading && <Text>Đang tải thông báo...</Text>}
    <FlatList data={items} keyExtractor={item => String(item.id)}
      ListEmptyComponent={!loading && !error ? <Text>Bạn chưa có thông báo.</Text> : null}
      ListFooterComponent={cursor ? <Button title="Xem thêm" disabled={loading || busy} onPress={() => load(cursor)} /> : null}
      renderItem={({ item }) => <View style={{ marginVertical: 6, padding: 12, borderRadius: 12, backgroundColor: item.readAt ? "#f3f4f6" : "#ecfdf5" }}>
        <Text style={{ fontWeight: "700" }}>{item.title}</Text>
        <Text>{<Raw>{item.message}</Raw>}</Text>
        <Text>{new Date(item.createdAt).toLocaleString("vi-VN")} · {item.readAt ? "Đã đọc" : "Chưa đọc"}</Text>
        <Button title={item.target === "Support" ? "Xem hỗ trợ" : item.target === "Profile" ? "Xem hồ sơ" : `Xem đơn CM${item.bookingId}`} onPress={() => {
          if (item.target === "Support") {navigation.navigate('Support');return;}
          if (item.target === "Orders") { Alert.alert("Đơn khách hàng", "Thông báo này thuộc đơn khách hàng. Vui lòng mở web/app khách hàng để xem."); return; }
          if (item.target === "Profile" || !user?.isCleaner) navigation.navigate("CleanerProfile");
          else navigation.navigate("Jobs", {bookingId:Number.isSafeInteger(item.bookingId) && item.bookingId > 0 ? item.bookingId : null});
        }} />
        {!item.readAt && <Button title="Đánh dấu đã đọc" disabled={loading || busy} onPress={() => mark(item)} />}
      </View>} />
  </View>;
}
