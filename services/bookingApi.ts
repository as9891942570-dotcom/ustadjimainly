import api from "@/lib/axios";
import type { BookingAddress } from "@/types/booking";

export interface CreateBookingPayload {
  service_id: number;
  address_id: number;
  booking_date: string;
  time_slot: string;
  latitude: number;
  longitude: number;
  amount: number;
  payment_method: string;
}

export interface ApiAddress {
  id?: number;
  address_id?: number;
  full_name?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["value", "data", "addresses", "results"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

function extractAddressId(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const candidates = [
    record.id,
    record.address_id,
    (record.data as Record<string, unknown> | undefined)?.id,
    (record.data as Record<string, unknown> | undefined)?.address_id,
    (record.address as Record<string, unknown> | undefined)?.id,
  ];
  for (const value of candidates) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export function mapApiAddress(record: ApiAddress): BookingAddress {
  const backendId = Number(record.id ?? record.address_id);
  return {
    id:
      Number.isFinite(backendId) && backendId > 0
        ? String(backendId)
        : `addr-${record.phone ?? "unknown"}-${record.pincode ?? "000000"}`,
    backendId: Number.isFinite(backendId) && backendId > 0 ? backendId : undefined,
    fullName: record.full_name || record.fullName || "",
    phone: record.phone || "",
    address: record.address || "",
    city: record.city || "",
    state: record.state || "",
    pincode: record.pincode || "",
  };
}

export async function fetchAddresses(userId: number): Promise<BookingAddress[]> {
  const { data } = await api.get<unknown>(`/auth/address/${userId}`);
  return unwrapList<ApiAddress>(data).map(mapApiAddress);
}

export async function addAddress(
  userId: number,
  address: Omit<BookingAddress, "id" | "backendId">
): Promise<BookingAddress> {
  const { data } = await api.post<unknown>(`/auth/address/${userId}`, {
    full_name: address.fullName,
    phone: address.phone,
    address: address.address,
    city: address.city,
    pincode: address.pincode,
  });

  const backendId = extractAddressId(data);
  if (backendId) {
    return {
      id: String(backendId),
      backendId,
      ...address,
    };
  }

  if (data && typeof data === "object") {
    const mapped = mapApiAddress(data as ApiAddress);
    if (mapped.fullName || mapped.address) {
      return { ...mapped, ...address, backendId: mapped.backendId };
    }
  }

  return {
    id: `addr-${Date.now()}`,
    ...address,
  };
}

/** Ensures the selected address has a backend id required by create-booking. */
export async function ensureAddressId(
  userId: number,
  address: BookingAddress
): Promise<number> {
  if (address.backendId && address.backendId > 0) {
    return address.backendId;
  }

  const numericId = Number(address.id);
  if (Number.isFinite(numericId) && numericId > 0 && !address.id.startsWith("addr-")) {
    return numericId;
  }

  const saved = await addAddress(userId, {
    fullName: address.fullName,
    phone: address.phone,
    address: address.address,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  });

  if (saved.backendId && saved.backendId > 0) {
    return saved.backendId;
  }

  throw new Error("Unable to save address on the server. Please try again.");
}

export async function createBooking(
  userId: number,
  payload: CreateBookingPayload
): Promise<unknown> {
  const { data } = await api.post(`/auth/create-booking/${userId}`, payload);
  return data;
}

export function getBookingLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve({ latitude: 0, longitude: 0 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        resolve({ latitude: 0, longitude: 0 });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  });
}
