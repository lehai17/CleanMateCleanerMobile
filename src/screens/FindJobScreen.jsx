import { useCallback, useRef, useState } from "react";
import { View, Text, FlatList, Button, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAvailableCleanerJobs, acceptCleanerJob } from "../api/jobs";

export default function FindJobScreen() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(null);
  const pending = useRef(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setJobs(await getAvailableCleanerJobs()); }
    catch (err) { setError(err?.response?.data?.message || "Không thể tải công việc. Vui lòng thử lại."); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const accept = async (id) => {
    if (pending.current) return;
    pending.current = true;
    setAccepting(id);
    try {
      await acceptCleanerJob(id);
      Alert.alert("Thành công", "Đã nhận công việc.");
    } catch (err) {
      Alert.alert("Không thể nhận việc", err?.response?.data?.message || "Vui lòng thử lại.");
    } finally {
      await load();
      pending.current = false;
      setAccepting(null);
    }
  };
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f9fafb" }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>Công việc đang chờ</Text>
      {error ? <Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{error}</Text> : null}
      <Button title="Tải lại" onPress={load} disabled={loading} />
      {loading ? <ActivityIndicator /> : <FlatList
        data={jobs} keyExtractor={(job) => String(job.id)}
        ListEmptyComponent={<Text>Chưa có công việc khả dụng.</Text>}
        renderItem={({ item }) => <View style={{ backgroundColor: "#fff", padding: 16, marginTop: 12, borderRadius: 12 }}>
          <Text style={{ fontWeight: "700" }}>CM{item.id} · {item.customerName}</Text>
          <Text>{new Date(item.startTime).toLocaleString("vi-VN")} · {item.durationHours} giờ</Text>
          <Text>{item.address}</Text>
          <Text>{item.notes}</Text>
          <Text>{item.price.toLocaleString("vi-VN")} đ · {item.paymentMethod}</Text>
          <Button title={accepting === item.id ? "Đang nhận..." : "Nhận việc"}
            disabled={accepting !== null} onPress={() => accept(item.id)} />
        </View>}
      />}
    </View>
  );
}
