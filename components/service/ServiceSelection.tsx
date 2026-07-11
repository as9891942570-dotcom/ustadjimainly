"use client";

import { AlertCircle, ArrowLeft, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ServiceCard from "@/components/ServiceCard";
import Button from "@/components/Button";
import { SkeletonCard } from "@/components/Loader";
import { useServices } from "@/hooks/useServices";
import { useServiceBooking } from "@/context/ServiceBookingContext";

export default function ServiceSelection() {
  const { setSelectedService } = useServiceBooking();
  const { services, loading, error, isEmpty, refetch } = useServices();
  const [search, setSearch] = useState("");

  const filtered = (services ?? []).filter(
    (s) =>
      (s?.title ?? "").toLowerCase().includes((search ?? "").toLowerCase()) ||
      (s?.description ?? "").toLowerCase().includes((search ?? "").toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Select a Service</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose the service you want to book
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/80 px-6 py-10 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <p className="font-medium text-gray-900">Failed to load services</p>
        <p className="mt-1 text-sm text-gray-600">{error}</p>
        <Button size="sm" className="mt-4" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select a Service</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose the service you want to book
          </p>
        </div>
        <Link href="/services">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-12 pr-4 backdrop-blur-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 py-12 text-center">
          <p className="font-medium text-gray-700">No services available</p>
          <p className="mt-1 text-sm text-gray-500">
            Please check back later or contact support.
          </p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => void refetch()}>
            Refresh
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 py-12 text-center">
          <p className="font-medium text-gray-700">No services found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={setSelectedService}
              showBookButton
            />
          ))}
        </div>
      )}
    </div>
  );
}
