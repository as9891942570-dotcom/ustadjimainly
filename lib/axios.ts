import axios, { AxiosError } from "axios";
import { clearAuthStorage, getToken } from "./auth";

// Proxied via next.config rewrites to avoid browser CORS blocks
const API_BASE_URL = "/backend";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string | { msg?: string }[]; message?: string }
      | undefined;

    if (data?.message) return data.message;

    if (Array.isArray(data?.detail)) {
      return data.detail.map((d) => d.msg).filter(Boolean).join(", ") || fallback;
    }

    if (typeof data?.detail === "string") return data.detail;

    if (error.code === "ECONNABORTED") {
      return "Request timed out. The server may be waking up — please try again.";
    }

    if (error.message === "Network Error") {
      return "Unable to reach the server. Please check your connection and try again.";
    }
  }

  return fallback;
}

export default api;
