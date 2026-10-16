import { api } from "./axios";

export const getNotifications = async beforeId => (await api.get("/api/notifications", { params: { beforeId } })).data;
export const getUnreadCount = async () => (await api.get("/api/notifications/unread-count")).data;
export const readNotification = async id => (await api.put(`/api/notifications/${id}/read`)).data;
export const readAllNotifications = async throughId => (await api.put("/api/notifications/read-all", { throughId })).data;
