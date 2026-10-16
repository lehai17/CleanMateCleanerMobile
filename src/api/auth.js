import { api } from "./axios";

export async function loginApi(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  // { token, user }
  return data;
}

export async function registerApi(payload) {
  const { data } = await api.post("/api/auth/register", {
    ...payload,
    role: payload.role || "Customer",
  });
  return data;
}

export async function meApi() {
  const { data } = await api.get("/api/me");
  return data; // { id, name, email, role }
}

export async function registerCleanerApi(payload) {
  const { data } = await api.post("/api/profile/register-cleaner", payload);
  return data;
}

export const resubmitCleanerApi = async payload => (await api.put("/api/profile/cleaner-application", payload)).data;
