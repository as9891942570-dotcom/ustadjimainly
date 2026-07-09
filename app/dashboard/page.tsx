"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/Button";
import { SkeletonCard } from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import api, { getApiErrorMessage } from "@/lib/axios";
import { ServiceRequest } from "@/types/user";
import { ClipboardList, Clock, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";

function DashboardContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<ServiceRequest[]>(
          `/auth/my-requests/${user.id}`
        );
        setRequests(Array.isArray(data) ? data : []);
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

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Welcome back, {user?.firstName || (user?.name ? user.name.trim().split(/\s+/)[0] : "") || "User"}! Manage your service requests here.
            </p>
          </div>
          <Link href="/book-service">
            <Button>
              <Plus className="h-4 w-4" />
              Book New Service
            </Button>
          </Link>
        </div>

        {/* Stats */}
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

        {/* Requests list */}
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
              <Link href="/services" className="mt-4 inline-block">
                <Button size="sm">Browse Services</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.request_id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{req.worker_type}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(req?.status)}`}
                      >
                        {req?.status ?? "-"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{req.problem}</p>
                    <p className="mt-1 text-xs text-gray-400">Request #{req.request_id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
