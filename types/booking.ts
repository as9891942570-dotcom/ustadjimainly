import type { Service } from "./service";

export interface ServicePreference {
  id: string;
  label: string;
  description: string;
}

export type BookingType = "full_time" | "hourly";

export interface BookingAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export type BookingStep =
  | "service"
  | "preference"
  | "booking-details"
  | "slot"
  | "summary"
  | "address"
  | "payment"
  | "confirmation";

export interface BookingState {
  selectedService: Service | null;
  selectedPreference: ServicePreference | null;
  bookingType: BookingType | null;
  quantity: number;
  hours: number;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedAddress: BookingAddress | null;
  estimatedAmount: number;
}

export const BOOKING_STEPS: { key: BookingStep; label: string }[] = [
  { key: "service", label: "Service" },
  { key: "preference", label: "Preference" },
  { key: "booking-details", label: "Booking" },
  { key: "slot", label: "Slot" },
  { key: "summary", label: "Summary" },
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" },
  { key: "confirmation", label: "Done" },
];

export const FULL_TIME_SLOTS: string[] = [
  "09:00 AM - 05:00 PM",
  "10:00 AM - 06:00 PM",
  "08:00 AM - 04:00 PM",
];

export const TIME_SLOTS: string[] = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
];

export const ADDRESSES_STORAGE_KEY = "ustadji_booking_addresses";
