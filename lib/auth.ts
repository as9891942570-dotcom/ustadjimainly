import { User, ApiCustomer } from "@/types/user";

const TOKEN_KEY = "ustadji_token";
const USER_KEY = "ustadji_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable */
  }
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
}

export function removeStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function clearAuthStorage(): void {
  removeToken();
  removeStoredUser();
}

export function mapApiCustomerToUser(
  customer?: ApiCustomer | null,
  extras?: Partial<User>
): User {
  const rawName = customer?.name ?? "";
  const nameParts = typeof rawName === "string" ? rawName.trim().split(/\s+/) : [];
  const firstName = extras?.firstName ?? nameParts[0] ?? "";
  const lastName =
    extras?.lastName ?? (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

  return {
    id: customer?.id ?? 0,
    firstName,
    lastName,
    name: customer?.name ?? extras?.name ?? "",
    mobile: customer?.phone || extras?.mobile || "",
    email: customer?.email ?? "",
    city: extras?.city ?? "",
    state: extras?.state ?? "",
    address: extras?.address ?? "",
    pincode: extras?.pincode ?? "",
    role: customer?.role ?? "",
  };
}

export function getUserIdFromToken(): number | null {
  const token = getToken();
  if (!token) return null;
  const id = parseInt(token, 10);
  return Number.isNaN(id) ? null : id;
}
