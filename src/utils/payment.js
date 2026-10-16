export function paymentLabel(status, method = "cash") {
  if (method !== "cash") return "Ghi nhận cũ cần kiểm tra";
  return status === "Paid" ? "Cleaner xác nhận đã nhận tiền mặt" : "Chưa có xác nhận nhận tiền mặt";
}
