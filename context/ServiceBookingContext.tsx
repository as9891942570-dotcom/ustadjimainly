"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Service } from "@/types/service";
import {
  BookingAddress,
  BookingState,
  BookingStep,
  BookingType,
  ServicePreference,
} from "@/types/booking";
import { calculateEstimatedAmount } from "@/utils/priceCalculation";

interface ServiceBookingContextValue extends BookingState {
  currentStep: BookingStep;
  setSelectedService: (service: Service) => void;
  setSelectedPreference: (preference: ServicePreference) => void;
  setBookingType: (type: BookingType) => void;
  setQuantity: (quantity: number) => void;
  setHours: (hours: number) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setSelectedAddress: (address: BookingAddress | null) => void;
  goToStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetBooking: () => void;
  isBookingDetailsValid: boolean;
  isSlotValid: boolean;
}

const STEP_ORDER: BookingStep[] = [
  "service",
  "preference",
  "booking-details",
  "slot",
  "summary",
  "address",
  "payment",
  "confirmation",
];

const initialState: BookingState = {
  selectedService: null,
  selectedPreference: null,
  bookingType: null,
  quantity: 1,
  hours: 2,
  selectedDate: null,
  selectedTime: null,
  selectedAddress: null,
  estimatedAmount: 0,
};

const ServiceBookingContext = createContext<ServiceBookingContextValue | undefined>(
  undefined
);

function computeAmount(state: BookingState): number {
  if (
    !state.selectedService ||
    !state.selectedPreference ||
    !state.bookingType
  ) {
    return 0;
  }

  return calculateEstimatedAmount({
    serviceId: state.selectedService.id,
    preferenceId: state.selectedPreference.id,
    bookingType: state.bookingType,
    quantity: state.quantity,
    hours: state.hours,
  });
}

export function ServiceBookingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [state, setState] = useState<BookingState>(initialState);

  const updateState = useCallback(
    (partial: Partial<BookingState>) => {
      setState((prev) => {
        const next = { ...prev, ...partial };
        next.estimatedAmount = computeAmount(next);
        return next;
      });
    },
    []
  );

  const setSelectedService = useCallback(
    (service: Service) => {
      updateState({
        selectedService: service,
        selectedPreference: null,
        selectedDate: null,
        selectedTime: null,
      });
      setCurrentStep("preference");
    },
    [updateState]
  );

  const setSelectedPreference = useCallback(
    (preference: ServicePreference) => {
      updateState({ selectedPreference: preference });
    },
    [updateState]
  );

  const setBookingType = useCallback(
    (type: BookingType) => {
      updateState({
        bookingType: type,
        selectedDate: null,
        selectedTime: null,
      });
    },
    [updateState]
  );

  const setQuantity = useCallback(
    (quantity: number) => {
      updateState({ quantity: Math.max(1, quantity) });
    },
    [updateState]
  );

  const setHours = useCallback(
    (hours: number) => {
      updateState({ hours: Math.max(1, hours) });
    },
    [updateState]
  );

  const setSelectedDate = useCallback(
    (date: string) => {
      updateState({ selectedDate: date });
    },
    [updateState]
  );

  const setSelectedTime = useCallback(
    (time: string) => {
      updateState({ selectedTime: time });
    },
    [updateState]
  );

  const setSelectedAddress = useCallback(
    (address: BookingAddress | null) => {
      updateState({ selectedAddress: address });
    },
    [updateState]
  );

  const goToStep = useCallback((step: BookingStep) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev);
      return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : prev;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEP_ORDER.indexOf(prev);
      return idx > 0 ? STEP_ORDER[idx - 1] : prev;
    });
  }, []);

  const resetBooking = useCallback(() => {
    setState(initialState);
    setCurrentStep("service");
  }, []);

  const isBookingDetailsValid = useMemo(() => {
    if (!state.bookingType) return false;
    if (state.quantity < 1) return false;
    if (state.bookingType === "hourly" && state.hours < 1) return false;
    return true;
  }, [state.bookingType, state.quantity, state.hours]);

  const isSlotValid = useMemo(
    () => !!state.selectedDate && !!state.selectedTime,
    [state.selectedDate, state.selectedTime]
  );

  const value = useMemo(
    () => ({
      ...state,
      currentStep,
      setSelectedService,
      setSelectedPreference,
      setBookingType,
      setQuantity,
      setHours,
      setSelectedDate,
      setSelectedTime,
      setSelectedAddress,
      goToStep,
      nextStep,
      prevStep,
      resetBooking,
      isBookingDetailsValid,
      isSlotValid,
    }),
    [
      state,
      currentStep,
      setSelectedService,
      setSelectedPreference,
      setBookingType,
      setQuantity,
      setHours,
      setSelectedDate,
      setSelectedTime,
      setSelectedAddress,
      goToStep,
      nextStep,
      prevStep,
      resetBooking,
      isBookingDetailsValid,
      isSlotValid,
    ]
  );

  return (
    <ServiceBookingContext.Provider value={value}>
      {children}
    </ServiceBookingContext.Provider>
  );
}

export function useServiceBooking() {
  const context = useContext(ServiceBookingContext);
  if (!context) {
    throw new Error("useServiceBooking must be used within ServiceBookingProvider");
  }
  return context;
}
