import { BookingType } from "@/types/booking";

const SERVICE_RATES: Record<string, { fullTime: number; hourly: number }> = {
  mistri: { fullTime: 700, hourly: 120 },
  labour: { fullTime: 500, hourly: 80 },
  labor: { fullTime: 500, hourly: 80 },
  plumber: { fullTime: 800, hourly: 150 },
  plumb: { fullTime: 800, hourly: 150 },
  electrician: { fullTime: 900, hourly: 175 },
  electric: { fullTime: 900, hourly: 175 },
  woodworker: { fullTime: 850, hourly: 160 },
  painter: { fullTime: 750, hourly: 140 },
  painting: { fullTime: 750, hourly: 140 },
  carpenter: { fullTime: 800, hourly: 150 },
  cleaner: { fullTime: 600, hourly: 100 },
  clean: { fullTime: 600, hourly: 100 },
};

const DEFAULT_RATES = { fullTime: 800, hourly: 150 };

export interface PriceCalculationInput {
  serviceId: string;
  preferenceId: string;
  bookingType: BookingType;
  quantity: number;
  hours: number;
}

export function calculateEstimatedAmount(input: PriceCalculationInput): number {
  const rates = SERVICE_RATES[input.serviceId] ?? DEFAULT_RATES;

  let baseAmount: number;

  if (input.bookingType === "full_time") {
    baseAmount = rates.fullTime * input.quantity;
  } else {
    baseAmount = rates.hourly * input.hours * input.quantity;
  }

  return Math.round(baseAmount);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
