"use client";

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Home, MapPin } from "lucide-react";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { formatCurrency } from "@/utils/priceCalculation";
import { useServiceBooking } from "@/context/ServiceBookingContext";

export default function OrderConfirmation() {
  const router = useRouter();
  const {
    selectedService,
    selectedPreference,
    bookingType,
    quantity,
    hours,
    selectedDate,
    selectedTime,
    selectedAddress,
    estimatedAmount,
    resetBooking,
  } = useServiceBooking();

  const [showSuccessPopup, setShowSuccessPopup] = useState(true);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasRedirectedRef = useRef(false);

  const handleGoHome = () => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    resetBooking();
    router.push("/");
  };

  useEffect(() => {
    redirectTimerRef.current = setTimeout(() => {
      handleGoHome();
    }, 5000);

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const formattedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="text-center">
      <Modal
        isOpen={showSuccessPopup}
        onClose={() => setShowSuccessPopup(false)}
        title="Order Confirmed"
      >
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 rounded-full bg-emerald-100 p-3 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Order Confirmed</h3>
          <p className="mt-2 text-sm text-gray-600">
            Your booking has been confirmed successfully.
          </p>
          <p className="mt-4 text-xs text-gray-400">
            Redirecting to Home page in 5 seconds...
          </p>
        </div>
      </Modal>

      <div className="mx-auto mb-6 inline-flex rounded-full bg-emerald-100 p-4">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Order Confirmed</h2>
      <p className="mt-2 text-gray-600">
        Your booking has been placed successfully. Pay cash to the professional on
        arrival.
      </p>

      <div className="mt-8 rounded-xl border border-white/40 bg-white/70 p-6 text-left shadow-sm backdrop-blur-md">
        <h3 className="mb-4 font-bold text-gray-900">Order Details</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Service</dt>
            <dd className="font-medium text-gray-900">{selectedService?.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Preference</dt>
            <dd className="font-medium text-gray-900">
              {selectedPreference?.label}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Booking Type</dt>
            <dd className="font-medium text-gray-900">
              {bookingType === "full_time" ? "Full Time" : "Hourly"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Quantity</dt>
            <dd className="font-medium text-gray-900">{quantity}</dd>
          </div>
          {bookingType === "hourly" && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Hours</dt>
              <dd className="font-medium text-gray-900">{hours}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">Date</dt>
            <dd className="font-medium text-gray-900">{formattedDate}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Time</dt>
            <dd className="font-medium text-gray-900">{selectedTime}</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3">
            <dt className="font-semibold text-gray-900">Amount</dt>
            <dd className="text-lg font-bold text-emerald-700">
              {formatCurrency(estimatedAmount)}
            </dd>
          </div>
        </dl>

        {selectedAddress && (
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Delivery Address
            </div>
            <p className="text-sm text-gray-700">{selectedAddress.fullName}</p>
            <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
            <p className="text-sm text-gray-600">
              {selectedAddress.address}, {selectedAddress.city} -{" "}
              {selectedAddress.pincode}
            </p>
          </div>
        )}
      </div>

      <Button size="lg" onClick={handleGoHome} className="mt-8">
        <Home className="h-5 w-5" />
        Go To Home
      </Button>
    </div>
  );
}
