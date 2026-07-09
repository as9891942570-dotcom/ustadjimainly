"use client";

import Link from "next/link";
import Button from "@/components/Button";
import ServiceCard from "@/components/ServiceCard";
import { SkeletonCard } from "@/components/Loader";
import { useServices } from "@/hooks/useServices";

export default function FeaturedServices() {
  const { services, loading, error } = useServices();
  const featuredServices = services.slice(0, 4);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error || featuredServices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 py-12 text-center">
        <p className="font-medium text-gray-700">
          {error ? "Unable to load services right now" : "No services available"}
        </p>
        <Link href="/services" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Browse Services
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/services">
          <Button variant="outline">View All Services</Button>
        </Link>
      </div>
    </>
  );
}
