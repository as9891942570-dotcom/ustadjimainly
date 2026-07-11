"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { SkeletonCard } from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import api, { getApiErrorMessage } from "@/lib/axios";
import { ServiceRequest } from "@/types/user";
import { ChevronRight, ClipboardList, Clock, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

function normalizeRequests(data: unknown): ServiceRequest[] {
  if (Array.isArray(data)) return data as ServiceRequest[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["requests", "data", "results", "value", "bookings"]) {
      if (Array.isArray(obj[key])) return obj[key] as ServiceRequest[];
    }
  }
  return [];
}

function getRequestId(req: ServiceRequest, index: number): string | number {
  return (
    req.request_id ??
    (req as { id?: number }).id ??
    (req as { booking_id?: number }).booking_id ??
    index
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<unknown>(`/auth/my-requests/${user.id}`);
        const all = normalizeRequests(data);
        // Keep only this user's requests when the API includes a user_id field
        const mine = all.filter((req) => {
          const ownerId =
            req.user_id ??
            (req as { customer_id?: number }).customer_id ??
            (req as { userId?: number }).userId;
          if (ownerId == null) return true;
          return Number(ownerId) === Number(user.id);
        });
        setRequests(mine);
      } catch (err) {
        const msg = getApiErrorMessage(err, "Failed to load requests");
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const statusColor = (status?: string | null) => {
    switch ((status ?? "").toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDetailDate = (req: ServiceRequest) => {
    const raw =
      req.booking_date ||
      req.created_at ||
      (req as { date?: string }).date ||
      (req as { scheduled_date?: string }).scheduled_date;
    if (!raw || typeof raw !== "string") return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;
    return parsed.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Welcome back,{" "}
              {user?.firstName ||
                (user?.name ? user.name.trim().split(/\s+/)[0] : "") ||
                "User"}
              ! Manage your service requests here.
            </p>
          </div>
          <Link href="/book-service">
            <Button>
              <Plus className="h-4 w-4" />
              Book New Service
            </Button>
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/40 bg-white/70 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/70 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => (r?.status ?? "").toLowerCase() === "pending").length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-white/40 bg-white/70 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-2.5 text-green-700">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.filter((r) => (r?.status ?? "").toLowerCase() === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-md">
          <h2 className="mb-6 text-lg font-bold text-gray-900">My Service Requests</h2>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
              <p className="font-medium text-red-800">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-12 text-center">
              <ClipboardList className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
              <p className="text-lg font-medium text-gray-700">No requests yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Book your first service to get started
              </p>
              <Link href="/book-service" className="mt-4 inline-block">
                <Button size="sm">Book a Service</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req, index) => {
                const id = getRequestId(req, index);
                const dateLabel = formatDetailDate(req);
                return (
                  <button
                    key={String(id)}
                    type="button"
                    onClick={() => setSelectedRequest(req)}
                    className="flex w-full flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 text-left transition hover:border-emerald-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {req.worker_type || "Service Request"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(req?.status)}`}
                        >
                          {req?.status ?? "-"}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-gray-600">{req.problem}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Request #{id}
                        {dateLabel ? ` · ${dateLabel}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {selectedRequest.worker_type || "Service Request"}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(selectedRequest.status)}`}
              >
                {selectedRequest.status ?? "-"}
              </span>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                <dt className="text-gray-500">Request ID</dt>
                <dd className="font-medium text-gray-900">
                  #{getRequestId(selectedRequest, 0)}
                </dd>
              </div>
              {formatDetailDate(selectedRequest) && (
                <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500">Booking Date</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDetailDate(selectedRequest)}
                  </dd>
                </div>
              )}
              {(selectedRequest.booking_time ||
                (selectedRequest as { time?: string }).time) && (
                <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                  <dt className="text-gray-500">Time</dt>
                  <dd className="font-medium text-gray-900">
                    {String(
                      selectedRequest.booking_time ||
                        (selectedRequest as { time?: string }).time
                    )}
                  </dd>
                </div>
              )}
              <div className="border-b border-gray-100 pb-2">
                <dt className="mb-1 text-gray-500">Details</dt>
                <dd className="font-medium text-gray-900 whitespace-pre-wrap">
                  {selectedRequest.problem || "—"}
                </dd>
              </div>
              {(selectedRequest.address || selectedRequest.city) && (
                <div className="border-b border-gray-100 pb-2">
                  <dt className="mb-1 text-gray-500">Address</dt>
                  <dd className="font-medium text-gray-900">
                    {[selectedRequest.address, selectedRequest.city, selectedRequest.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              )}
              {selectedRequest.amount != null && selectedRequest.amount !== "" && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-medium text-gray-900">
                    {String(selectedRequest.amount)}
                  </dd>
                </div>
              )}
            </dl>

            <Button className="w-full" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
