"use client";

import { INDIAN_STATES, getCitiesForState } from "@/lib/indiaLocations";

interface LocationSelectProps {
  state: string;
  city: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  stateError?: string;
  cityError?: string;
  stateId?: string;
  cityId?: string;
}

const selectClass =
  "w-full rounded-xl border bg-white/80 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export default function LocationSelect({
  state,
  city,
  onStateChange,
  onCityChange,
  stateError,
  cityError,
  stateId = "state",
  cityId = "city",
}: LocationSelectProps) {
  const cities = getCitiesForState(state);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="w-full">
        <label htmlFor={stateId} className="mb-1.5 block text-sm font-medium text-gray-700">
          State
        </label>
        <select
          id={stateId}
          value={state}
          onChange={(e) => {
            onStateChange(e.target.value);
            onCityChange("");
          }}
          className={`${selectClass} ${stateError ? "border-red-400" : "border-gray-200"}`}
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {stateError && <p className="mt-1.5 text-sm text-red-500">{stateError}</p>}
      </div>

      <div className="w-full">
        <label htmlFor={cityId} className="mb-1.5 block text-sm font-medium text-gray-700">
          City
        </label>
        <select
          id={cityId}
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!state}
          className={`${selectClass} ${cityError ? "border-red-400" : "border-gray-200"} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
        >
          <option value="">{state ? "Select city" : "Select state first"}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          {city && !cities.includes(city) && (
            <option value={city}>{city}</option>
          )}
        </select>
        {cityError && <p className="mt-1.5 text-sm text-red-500">{cityError}</p>}
      </div>
    </div>
  );
}
