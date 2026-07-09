"use client";

import { Check } from "lucide-react";
import Button from "@/components/Button";
import { useServiceBooking } from "@/context/ServiceBookingContext";

export default function PreferenceSelection() {
  const {
    selectedService,
    selectedPreference,
    setSelectedPreference,
    nextStep,
    prevStep,
  } = useServiceBooking();

  const preferences = selectedService?.preferences ?? [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Select Preference</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose the option that best fits your {selectedService?.title ?? "service"} needs
        </p>
      </div>

      {preferences.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 py-10 text-center">
          <p className="font-medium text-gray-700">No preferences available</p>
          <p className="mt-1 text-sm text-gray-500">
            Go back and select a different service.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {preferences.map((pref) => {
            const isSelected = selectedPreference?.id === pref.id;
            return (
              <button
                key={pref.id}
                type="button"
                onClick={() => setSelectedPreference(pref)}
                className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/80 shadow-sm"
                    : "border-gray-200 bg-white/80 hover:border-emerald-300"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{pref.label}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{pref.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={prevStep}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!selectedPreference}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
