"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Banknote } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/Button";
import { ServiceBookingProvider, useServiceBooking } from "@/context/ServiceBookingContext";
import { useAuth } from "@/context/AuthContext";
import { BOOKING_STEPS, BookingStep } from "@/types/booking";
import { fetchServiceById } from "@/services/serviceApi";
import ServiceSelection from "@/components/service/ServiceSelection";
import PreferenceSelection from "@/components/service/PreferenceSelection";
import BookingDetails from "@/components/service/BookingDetails";
import SlotSelection from "@/components/service/SlotSelection";
import OrderSummary from "@/components/service/OrderSummary";
import AddressSelector from "@/components/service/AddressSelector";
import OrderConfirmation from "@/components/service/OrderConfirmation";
import { formatCurrency } from "@/utils/priceCalculation";
import { getApiErrorMessage } from "@/lib/axios";
import {
  createBooking,
  ensureAddressId,
  getBookingLocation,
} from "@/services/bookingApi";

function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  const currentIdx = BOOKING_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex min-w-max items-center gap-1 px-1">
        {BOOKING_STEPS.map((step, idx) => {
          const isActive = idx === currentIdx;
          const isCompleted = idx < currentIdx;
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <span
                  className={`mt-1 hidden text-xs sm:block ${
                    isActive ? "font-semibold text-emerald-700" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < BOOKING_STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 w-6 sm:w-10 ${
                    isCompleted ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentStep() {
  const { user } = useAuth();
  const {
    selectedService,
    selectedPreference,
    selectedDate,
    selectedTime,
    selectedAddress,
    estimatedAmount,
    nextStep,
    prevStep,
  } = useServiceBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!user?.id) {
      toast.error("Please log in to complete your booking");
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime || !selectedAddress) {
      toast.error("Missing booking details. Please go back and complete all steps.");
      return;
    }

    setIsSubmitting(true);
    try {
      const addressId = await ensureAddressId(user.id, selectedAddress);
      const { latitude, longitude } = await getBookingLocation();

      const serviceId = Number(selectedPreference?.id || selectedService.id);
      if (!Number.isFinite(serviceId) || serviceId <= 0) {
        throw new Error("Invalid service selected");
      }

      await createBooking(user.id, {
        service_id: serviceId,
        address_id: addressId,
        booking_date: selectedDate,
        time_slot: selectedTime,
        latitude,
        longitude,
        amount: Math.round(estimatedAmount),
        payment_method: "cash",
      });

      toast.success("Booking created successfully");
      nextStep();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to create booking"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Payment</h2>
        <p className="mt-1 text-sm text-gray-600">
          Complete your booking with cash payment
        </p>
      </div>

      <div className="rounded-xl border border-white/40 bg-white/70 p-6 text-center shadow-sm backdrop-blur-md">
        <div className="mx-auto mb-4 inline-flex rounded-xl bg-emerald-100 p-4">
          <Banknote className="h-10 w-10 text-emerald-600" />
        </div>
        <p className="text-lg font-semibold text-gray-900">Pay Cash</p>
        <p className="mt-2 text-sm text-gray-600">
          Pay the professional directly when the service is completed.
        </p>
        <p className="mt-4 text-2xl font-bold text-emerald-700">
          {formatCurrency(estimatedAmount)}
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={prevStep} disabled={isSubmitting}>
          Back
        </Button>
        <Button className="flex-1" onClick={() => void handleConfirm()} isLoading={isSubmitting}>
          Confirm & Pay Cash
        </Button>
      </div>
    </div>
  );
}

function BookingFlowContent() {
  const searchParams = useSearchParams();
  const { currentStep, setSelectedService } = useServiceBooking();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const serviceId = searchParams.get("service");
    if (!serviceId) return;

    initializedRef.current = true;

    void fetchServiceById(serviceId).then((service) => {
      if (service) {
        setSelectedService(service);
      }
    });
  }, [searchParams, setSelectedService]);

  const renderStep = () => {
    switch (currentStep) {
      case "service":
        return <ServiceSelection />;
      case "preference":
        return <PreferenceSelection />;
      case "booking-details":
        return <BookingDetails />;
      case "slot":
        return <SlotSelection />;
      case "summary":
        return <OrderSummary />;
      case "address":
        return <AddressSelector />;
      case "payment":
        return <PaymentStep />;
      case "confirmation":
        return <OrderConfirmation />;
      default:
        return <ServiceSelection />;
    }
  };

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link
            href="/services"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Book a Service
            </h1>
            <p className="mt-1 text-gray-600">
              Complete the steps below to schedule your service
            </p>
          </div>
        </div>

        {currentStep !== "confirmation" && (
          <StepIndicator currentStep={currentStep} />
        )}

        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-emerald-500/5 backdrop-blur-md sm:p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

function BookServicePageInner() {
  return (
    <ServiceBookingProvider>
      <BookingFlowContent />
    </ServiceBookingProvider>
  );
}

export default function BookServicePage() {
  return (
    <ProtectedRoute>
      <BookServicePageInner />
    </ProtectedRoute>
  );
}
