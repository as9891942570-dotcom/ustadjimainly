"use client";

import { Clock, CalendarDays } from "lucide-react";
import Button from "@/components/Button";
import { useServiceBooking } from "@/context/ServiceBookingContext";

function QuantityControl({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-semibold text-gray-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-lg font-bold text-gray-900">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-semibold text-gray-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function BookingDetails() {
  const {
    bookingType,
    setBookingType,
    quantity,
    setQuantity,
    hours,
    setHours,
    isBookingDetailsValid,
    nextStep,
    prevStep,
  } = useServiceBooking();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Booking Type</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose how you want to book the service
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setBookingType("full_time")}
          className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition ${
            bookingType === "full_time"
              ? "border-emerald-500 bg-emerald-50/80"
              : "border-gray-200 bg-white/80 hover:border-emerald-300"
          }`}
        >
          <CalendarDays
            className={`h-8 w-8 ${
              bookingType === "full_time" ? "text-emerald-600" : "text-gray-400"
            }`}
          />
          <span className="font-semibold text-gray-900">Full Time</span>
          <span className="text-xs text-gray-500">Full day booking</span>
        </button>

        <button
          type="button"
          onClick={() => setBookingType("hourly")}
          className={`flex flex-col items-center gap-2 rounded-xl border p-5 transition ${
            bookingType === "hourly"
              ? "border-emerald-500 bg-emerald-50/80"
              : "border-gray-200 bg-white/80 hover:border-emerald-300"
          }`}
        >
          <Clock
            className={`h-8 w-8 ${
              bookingType === "hourly" ? "text-emerald-600" : "text-gray-400"
            }`}
          />
          <span className="font-semibold text-gray-900">Hourly</span>
          <span className="text-xs text-gray-500">Pay per hour</span>
        </button>
      </div>

      {bookingType && (
        <div className="rounded-xl border border-gray-100 bg-white/70 p-5">
          <div className="flex flex-wrap gap-8">
            {bookingType === "hourly" && (
              <QuantityControl
                label="Hours"
                value={hours}
                onChange={setHours}
                min={1}
                max={12}
              />
            )}
            <QuantityControl
              label="Quantity"
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={5}
            />
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={prevStep}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!isBookingDetailsValid}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
