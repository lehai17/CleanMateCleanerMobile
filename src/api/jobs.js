import { api } from "./axios";

export async function getCleanerJobs() {
  const { data } = await api.get("/api/cleaner/jobs/mine");
  return data;
}
export async function getAvailableCleanerJobs() {
  const { data } = await api.get("/api/cleaner/jobs/available");
  return data;
}
export async function acceptCleanerJob(id) {
  const { data } = await api.put(`/api/cleaner/jobs/${id}/accept`);
  return data;
}

export async function startCleanerJob(id) {
  const { data } = await api.put(`/api/cleaner/jobs/${id}/start`);
  return data;
}

export async function completeCleanerJob(id) {
  const { data } = await api.put(`/api/cleaner/jobs/${id}/complete`);
  return data;
}

export async function confirmCashPayment(id) {
  const { data } = await api.put(`/api/cleaner/jobs/${id}/cash-payment`);
  return data;
}
