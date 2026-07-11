import { WorkerAccount } from "@/types/worker";

const WORKER_TOKEN_KEY = "ustadji_worker_token";
const WORKER_USER_KEY = "ustadji_worker_user";
const WORKER_PROFILE_ID_KEY = "ustadji_worker_profile_id";

export function getWorkerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(WORKER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setWorkerToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKER_TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function removeWorkerToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WORKER_TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getStoredWorkerUser(): WorkerAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKER_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkerAccount;
  } catch {
    return null;
  }
}

export function setStoredWorkerUser(user: WorkerAccount): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKER_USER_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
}

export function removeStoredWorkerUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WORKER_USER_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getStoredWorkerProfileId(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKER_PROFILE_ID_KEY);
    if (!raw) return null;
    const id = parseInt(raw, 10);
    return Number.isNaN(id) ? null : id;
  } catch {
    return null;
  }
}

export function setStoredWorkerProfileId(workerId: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WORKER_PROFILE_ID_KEY, String(workerId));
  } catch {
    /* storage unavailable */
  }
}

export function removeStoredWorkerProfileId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WORKER_PROFILE_ID_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function clearWorkerAuthStorage(): void {
  removeWorkerToken();
  removeStoredWorkerUser();
  removeStoredWorkerProfileId();
  removePendingWorkerDetails();
}

export interface PendingWorkerDetails {
  name: string;
  email?: string;
  mobile: string;
  city: string;
  state: string;
  address: string;
  pincode: string;
}

const PENDING_WORKER_DETAILS_KEY = "ustadji_pending_worker_details";

export function getPendingWorkerDetails(): PendingWorkerDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_WORKER_DETAILS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingWorkerDetails;
  } catch {
    return null;
  }
}

export function setPendingWorkerDetails(details: PendingWorkerDetails): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_WORKER_DETAILS_KEY, JSON.stringify(details));
  } catch {
    /* storage unavailable */
  }
}

export function removePendingWorkerDetails(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PENDING_WORKER_DETAILS_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getWorkerUserIdFromToken(): number | null {
  const token = getWorkerToken();
  if (!token) return null;
  const id = parseInt(token, 10);
  return Number.isNaN(id) ? null : id;
}
