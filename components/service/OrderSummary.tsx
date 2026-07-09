"use client";

import Button from "@/components/Button";
import { formatCurrency } from "@/utils/priceCalculation";
import { useServiceBooking } from "@/context/ServiceBookingContext";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-3 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

export default function OrderSummary() {
  const {
    selectedService,
    selectedPreference,
    bookingType,
    quantity,
    hours,
    selectedDate,
    selectedTime,
    estimatedAmount,
    nextStep,
    prevStep,
  } = useServiceBooking();

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
        <p className="mt-1 text-sm text-gray-600">Review your booking details</p>
      </div>

      <div className="rounded-xl border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-md">
        <dl>
          <SummaryRow label="Service" value={selectedService?.title ?? "—"} />
          <SummaryRow
            label="Preference"
            value={selectedPreference?.label ?? "—"}
          />
          <SummaryRow
            label="Booking Type"
            value={bookingType === "full_time" ? "Full Time" : "Hourly"}
          />
          <SummaryRow label="Quantity" value={String(quantity)} />
          {bookingType === "hourly" && (
            <SummaryRow label="Hours" value={String(hours)} />
          )}
          <SummaryRow label="Date" value={formattedDate} />
          <SummaryRow label="Time" value={selectedTime ?? "—"} />
        </dl>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
          <span className="font-semibold text-gray-900">Estimated Amount</span>
          <span className="text-xl font-bold text-emerald-700">
            {formatCurrency(estimatedAmount)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={prevStep}>
          Back
        </Button>
        <Button className="flex-1" onClick={nextStep}>
          Continue
        </Button>
      </div>
    </div>
  );
}
