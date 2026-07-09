"use client";

import { Calendar, Clock } from "lucide-react";
import Button from "@/components/Button";
import { FULL_TIME_SLOTS, TIME_SLOTS } from "@/types/booking";
import { useServiceBooking } from "@/context/ServiceBookingContext";

function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

function getMaxDate(): string {
  const max = new Date();
  max.setDate(max.getDate() + 30);
  return max.toISOString().split("T")[0];
}

function getNextDays(count: number): { value: string; label: string }[] {
  const days: { value: string; label: string }[] = [];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
      }),
    });
  }

  return days;
}

function HourlySlotSelection({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string) => void;
}) {
  return (
    <>
      <div className="mb-6">
        <label
          htmlFor="booking-date"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <Calendar className="h-4 w-4 text-emerald-600" />
          Date
        </label>
        <input
          id="booking-date"
          type="date"
          min={getMinDate()}
          max={getMaxDate()}
          value={selectedDate ?? ""}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-gray-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="h-4 w-4 text-emerald-600" />
          Time Slot
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white/80 text-gray-700 hover:border-emerald-300"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function FullTimeSlotSelection({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string) => void;
}) {
  const dateOptions = getNextDays(3);

  return (
    <>
      <div className="mb-6">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Calendar className="h-4 w-4 text-emerald-600" />
          Select Date
        </p>
        <div className="grid grid-cols-3 gap-2">
          {dateOptions.map((day) => {
            const isSelected = selectedDate === day.value;
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => setSelectedDate(day.value)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white/80 text-gray-700 hover:border-emerald-300"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="h-4 w-4 text-emerald-600" />
          Select Time Slot
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {FULL_TIME_SLOTS.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedTime(slot)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white/80 text-gray-700 hover:border-emerald-300"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function SlotSelection() {
  const {
    bookingType,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    isSlotValid,
    nextStep,
    prevStep,
  } = useServiceBooking();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Select Date & Time</h2>
        <p className="mt-1 text-sm text-gray-600">
          {bookingType === "full_time"
            ? "Pick your preferred full-day slot"
            : "Pick your preferred appointment slot"}
        </p>
      </div>

      {bookingType === "full_time" ? (
        <FullTimeSlotSelection
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      ) : (
        <HourlySlotSelection
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />
      )}

      {!isSlotValid && (selectedDate || selectedTime) && (
        <p className="mt-4 text-sm text-amber-700">
          Please select both a date and a time slot to continue.
        </p>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={prevStep}>
          Back
        </Button>
        <Button className="flex-1" disabled={!isSlotValid} onClick={nextStep}>
          Continue
        </Button>
      </div>
    </div>
  );
}
