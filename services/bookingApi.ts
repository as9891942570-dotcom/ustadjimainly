import api from "@/lib/axios";

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
