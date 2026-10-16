import { Raw, useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, FlatList, Text, View } from './../ui/Preferences';
import { useFocusEffect } from "@react-navigation/native";
import { completeCleanerJob, confirmCashPayment, getCleanerJobs, startCleanerJob } from "../api/jobs";
import { paymentLabel } from "../utils/payment";
import { actionFor, filterJobs } from "../domain";
import JobFilters from "./JobFilters";
import JobContacts from "./JobContacts";

export default function CleanerJobList({ chronological = false, selectedBookingId = null, onClearSelection }) {
  useCleanMateUi();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyJobId, setBusyJobId] = useState(null);
  const pending = useRef(false);
  const [filters,setFilters] = useState({search:'',status:'All',day:''});
  const selected = Number.isSafeInteger(selectedBookingId) && selectedBookingId > 0 ? selectedBookingId : null;
  const hasActiveJob = jobs.some(job => job.status === "InProgress");
  const visible = filterJobs(jobs, {...(selected ? {bookingId:selected} : filters),calendar:chronological});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCleanerJobs();
      setJobs(result);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải công việc. Vui lòng thử lại.");
    } finally { setLoading(false); }
  }, [chronological]);

  const refresh = useCallback(() => { setError(""); return load(); }, [load]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const advance = async (job) => {
    if (pending.current) return;
    const action = actionFor(job);
    if (!["start", "complete", "cash-payment"].includes(action)) return;
    pending.current = true;
    setBusyJobId(job.id);
    setError("");
    try {
      if (action === "start") await startCleanerJob(job.id);
      else if (action === "complete") await completeCleanerJob(job.id);
      else if (action === "cash-payment") await confirmCashPayment(job.id);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể cập nhật công việc. Vui lòng thử lại.");
    } finally {
      await load();
      pending.current = false;
      setBusyJobId(null);
    }
  };
  return <View style={{ flex: 1 }}>
    {error ? <Text accessibilityRole="alert" style={{ color: "#b91c1c", marginVertical: 8 }}>{error}</Text> : null}
    <Button title="Tải lại" onPress={refresh} disabled={loading || busyJobId !== null} />
    <Text>Ca trùng lịch đã nhận được ẩn. Hoàn thành ca đang làm trước khi bắt đầu ca tiếp theo.</Text>
    {selected ? <View><Text>Đang xem công việc CM{selected} từ thông báo.</Text><Button title="Xem tất cả công việc" onPress={() => {setFilters({search:'',status:'All',day:''});onClearSelection?.();}} /></View> : <JobFilters value={filters} onChange={setFilters} statuses={chronological ? ['All','Accepted','InProgress'] : ['All','Accepted','InProgress','Completed','Cancelled']} />}
    {!loading && !error && <Text>{visible.length} công việc phù hợp</Text>}
    {loading ? <ActivityIndicator /> : <FlatList
      data={visible} keyExtractor={(job) => String(job.id)} keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<Text>{selected ? 'Không tìm thấy ca này trong công việc của bạn. Thử tải lại hoặc xem tất cả công việc.' : 'Không có công việc phù hợp. Thử xóa bộ lọc hoặc chọn ngày khác.'}</Text>}
      renderItem={({ item }) => <View style={{ padding: 16, marginTop: 12, backgroundColor: "#f3f4f6", borderRadius: 12 }}>
        <Text style={{ fontWeight: "700" }}>CM{item.id} · {item.status}</Text>
        <Text>Lịch dự kiến: {formatDate(item.startTime)} → {formatDate(new Date(new Date(item.startTime).getTime() + item.durationHours * 3600000))} · {item.durationHours} giờ</Text>
        <Text>{<Raw>{item.address}</Raw>}</Text>
        <Text>{<Raw>{item.customerName}</Raw>} · {item.customerPhone}</Text>
        <JobContacts job={item} />
        <Text>{item.price.toLocaleString("vi-VN")} đ</Text>
        <Text>{paymentLabel(item.paymentStatus, item.paymentMethod)}</Text>
        {item.paidAt && <Text>Thời gian xác nhận: {formatDate(item.paidAt)}</Text>}
        {item.customerConfirmedAt && <Text>Khách đã xác nhận hoàn thành · Đánh giá: {item.customerRating}/5 sao</Text>}
        {item.status === "Accepted" && hasActiveJob &&
          <Text>Hoàn thành ca đang làm trước khi bắt đầu ca này.</Text>}
        {item.startedAt && <Text>Bắt đầu thực tế: {formatDate(item.startedAt)}</Text>}
        {item.completedAt && <Text>Hoàn thành thực tế: {formatDate(item.completedAt)}</Text>}
        {(item.status === "Accepted" || item.status === "InProgress") && <Button
          title={busyJobId === item.id ? "Đang cập nhật..." : item.status === "Accepted" ? "Bắt đầu công việc" : "Hoàn thành công việc"}
          disabled={busyJobId !== null || (item.status === "Accepted" && hasActiveJob)} onPress={() => advance(item)} />}
        {item.status === "Completed" && item.paymentStatus !== "Paid" && item.paymentMethod === "cash" && <Button
          title="Xác nhận đã nhận tiền mặt" disabled={busyJobId !== null}
          onPress={() => Alert.alert("Xác nhận thu tiền", `Đã nhận đủ ${item.price.toLocaleString("vi-VN")} đ cho CM${item.id}?`, [
            { text: "Hủy", style: "cancel" }, { text: "Đã nhận đủ", onPress: () => advance(item) },
          ])} />}
      </View>}
    />}
  </View>;
}

function formatDate(value) {
  return new Date(value).toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"});
}
