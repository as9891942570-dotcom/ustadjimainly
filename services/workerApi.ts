import axios, { AxiosError } from "axios";
import {
  clearWorkerAuthStorage,
  getWorkerToken,
} from "@/lib/workerAuth";
import {
  WorkerCreatePayload,
  WorkerLoginPayload,
  WorkerLoginResponse,
  WorkerProfile,
  WorkerRegisterPayload,
  WorkerRegisterResponse,
  WorkerUserProfileResponse,
} from "@/types/worker";

const BASE_URL = "/worker-api";

export const workerApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
});

workerApi.interceptors.request.use(
  (config) => {
    const token = getWorkerToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

workerApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      clearWorkerAuthStorage();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/worker/login")
      ) {
        window.location.href = "/worker/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getWorkerApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
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
      return "Unable to reach the worker server. Please check your connection and try again.";
    }
  }

  return fallback;
}

function extractWorkerId(data: Record<string, unknown>): number | null {
  const candidates = [data.worker_id, data.id, data.workerId];
  for (const value of candidates) {
    if (typeof value === "number" && !Number.isNaN(value)) return value;
    if (typeof value === "string") {
      const parsed = parseInt(value, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

export async function workerRegister(
  payload: WorkerRegisterPayload
): Promise<WorkerRegisterResponse> {
  const { data } = await workerApi.post<WorkerRegisterResponse>("/register", payload);
  return data;
}

export async function workerLogin(
  payload: WorkerLoginPayload
): Promise<WorkerLoginResponse> {
  const { data } = await workerApi.post<WorkerLoginResponse>("/login", payload);
  return data;
}

export async function workerLogout(userId: number): Promise<void> {
  await workerApi.post(`/logout/${userId}`);
}

export async function getWorkerUserProfile(
  mobile: string
): Promise<WorkerUserProfileResponse> {
  const { data } = await workerApi.get<WorkerUserProfileResponse>(`/profile/${mobile}`);
  return data;
}

export async function createWorkerProfile(
  payload: WorkerCreatePayload
): Promise<WorkerProfile> {
  const { data } = await workerApi.post<WorkerProfile>("/worker-profile", payload);
  return data || {} as WorkerProfile;
}

export async function getWorkerProfile(workerId: number): Promise<WorkerProfile> {
  const { data } = await workerApi.get<WorkerProfile>(`/worker-profile/${workerId}`);
  const safeData = data || {} as WorkerProfile;
  return {
    ...safeData,
    worker_id: extractWorkerId(safeData as unknown as Record<string, unknown>) ?? workerId,
  };
}

export async function updateWorkerProfile(
  workerId: number,
  payload: WorkerCreatePayload
): Promise<WorkerProfile> {
  const { data } = await workerApi.put<WorkerProfile>(
    `/worker-profile/${workerId}`,
    payload
  );
  const safeData = data || {} as WorkerProfile;
  return {
    ...safeData,
    worker_id: extractWorkerId(safeData as unknown as Record<string, unknown>) ?? workerId,
  };
}

export async function deleteWorkerProfile(workerId: number): Promise<void> {
  await workerApi.delete(`/worker-profile/${workerId}`);
}

/**
 * The Worker API OpenAPI spec does not expose a list-all-workers route.
 * This helper resolves the logged-in worker's profile via mobile lookup.
 */
export async function getLoggedInWorkerProfile(
  mobile: string,
  storedWorkerId?: number | null
): Promise<WorkerProfile | null> {
  if (storedWorkerId) {
    try {
      const profile = await getWorkerProfile(storedWorkerId);
      if (profile && typeof profile === "object") {
        return profile;
      }
    } catch {
      /* fall through to mobile lookup */
    }
  }

  try {
    const userProfile = await getWorkerUserProfile(mobile);
    const workerId =
      userProfile && typeof userProfile.worker_id === "number"
        ? userProfile.worker_id
        : userProfile && typeof userProfile.worker_id === "string"
          ? parseInt(userProfile.worker_id, 10)
          : null;

    if (workerId && !Number.isNaN(workerId)) {
      return await getWorkerProfile(workerId);
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * No GET /workers endpoint exists on the backend.
 * Returns an empty list and surfaces a clear message for the UI.
 */
export async function getAllWorkers(): Promise<{
  workers: WorkerProfile[];
  unavailable: boolean;
}> {
  return { workers: [], unavailable: true };
}

export default workerApi;
