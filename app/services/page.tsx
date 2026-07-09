"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ServiceCard from "@/components/ServiceCard";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { SkeletonCard } from "@/components/Loader";
import { Service } from "@/types/service";
import { useServices } from "@/hooks/useServices";
import api, { getApiErrorMessage } from "@/lib/axios";

export default function ServicesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { services, loading, error, isEmpty, refetch } = useServices();
  const [search, setSearch] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [problem, setProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = (services ?? []).filter(
    (s) =>
      (s?.title ?? "").toLowerCase().includes((search ?? "").toLowerCase()) ||
      (s?.description ?? "").toLowerCase().includes((search ?? "").toLowerCase())
  );

  const handleBook = (service: Service) => {
    if (!isAuthenticated) {
      toast.info("Please login to book a service");
      router.push("/login");
      return;
    }
    router.push(`/book-service?service=${service.id}`);
  };

  const handleQuickRequest = (service: Service) => {
    if (!isAuthenticated) {
      toast.info("Please login to book a service");
      router.push("/login");
      return;
    }
    setSelectedService(service);
    setProblem("");
  };

  const handleSubmitRequest = async () => {
    if (!selectedService || !user) return;
    if (!problem.trim()) {
      toast.error("Please describe your problem");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/auth/request-service/${user.id}`, {
        worker_type: selectedService.workerType,
        problem: problem.trim(),
      });
      toast.success("Service request submitted successfully!");
      setSelectedService(null);
      router.push("/dashboard");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to submit request"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Our Services
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Browse our marketplace of skilled professionals and book the right expert
            for your home
          </p>
        </div>

        <div className="relative mx-auto mb-10 max-w-md">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-12 pr-4 backdrop-blur-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50/80 px-6 py-16 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <p className="text-lg font-medium text-gray-900">Failed to load services</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
            <Button size="sm" className="mt-4" onClick={() => void refetch()}>
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 py-16 text-center">
            <p className="text-lg font-medium text-gray-700">No services available</p>
            <p className="mt-1 text-sm text-gray-500">
              Please check back later or contact support.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-white/60 py-16 text-center">
            <p className="text-lg font-medium text-gray-700">No services found</p>
            <p className="mt-1 text-sm text-gray-500">Try a different search term</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((service) => (
              <div key={service.id} className="flex flex-col">
                <ServiceCard
                  service={service}
                  onBook={handleBook}
                  showBookButton
                />
                <button
                  type="button"
                  onClick={() => handleQuickRequest(service)}
                  className="mt-2 text-center text-xs font-medium text-emerald-700 hover:underline"
                >
                  Quick request instead
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={`Quick Request — ${selectedService?.title ?? "Service"}`}
      >
        <p className="mb-4 text-sm text-gray-600">
          Describe the problem or work you need done. Our team will match you with
          the best professional.
        </p>
        <Input
          label="Problem / Description"
          placeholder="e.g. Kitchen tap is leaking..."
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setSelectedService(null)}>
            Cancel
          </Button>
          <Button className="flex-1" isLoading={isSubmitting} onClick={handleSubmitRequest}>
            Submit Request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
