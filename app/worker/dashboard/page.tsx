"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  HardHat,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Check,
} from "lucide-react";
import WorkerProtectedRoute from "@/components/WorkerProtectedRoute";
import WorkerForm from "@/components/WorkerForm";
import WorkerProfileCard from "@/components/WorkerProfile";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import { SkeletonCard } from "@/components/Loader";
import {
  getWorkerApiErrorMessage,
  useWorkerAuth,
} from "@/context/WorkerAuthContext";
import { WorkerCreatePayload } from "@/types/worker";

type DashboardView = "view" | "create" | "edit";

const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8 flex justify-center">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {step > 1 ? <Check className="h-3.5 w-3.5" /> : "1"}
          </span>
          <span
            className={`text-xs font-semibold ${
              step >= 1 ? "text-emerald-700" : "text-gray-500"
            }`}
          >
            Details
          </span>
        </div>
        <div className={`h-0.5 w-12 ${step >= 2 ? "bg-emerald-600" : "bg-gray-200"}`} />
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {step > 2 ? <Check className="h-3.5 w-3.5" /> : "2"}
          </span>
          <span
            className={`text-xs font-semibold ${
              step >= 2 ? "text-emerald-700" : "text-gray-500"
            }`}
          >
            Documents
          </span>
        </div>
        <div className={`h-0.5 w-12 ${step >= 3 ? "bg-emerald-600" : "bg-gray-200"}`} />
        <div className="flex items-center gap-1.5">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step >= 3 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            3
          </span>
          <span
            className={`text-xs font-semibold ${
              step >= 3 ? "text-emerald-700" : "text-gray-500"
            }`}
          >
            Status
          </span>
        </div>
      </div>
    </div>
  );
}

function WorkerDashboardContent() {
  const {
    workerAccount,
    workerProfile,
    isProfileLoading,
    logout,
    refreshProfile,
    createProfile,
    updateProfile,
    removeProfile,
  } = useWorkerAuth();

  const [view, setView] = useState<DashboardView>("view");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // KYC 3-Step Flow States
  const [kycStep, setKycStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<WorkerCreatePayload | null>(null);
  const [step2Images, setStep2Images] = useState({
    profile_image: "",
    aadhaar_front: "",
    aadhaar_back: "",
  });

  // Pre-fill states when profile exists and we are editing or resubmitting
  useEffect(() => {
    if (workerProfile) {
      setStep2Images({
        profile_image: workerProfile.profile_image || "",
        aadhaar_front: workerProfile.aadhaar_front || "",
        aadhaar_back: workerProfile.aadhaar_back || "",
      });
    }
  }, [workerProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      toast.success("Profile status updated");
    } catch (error) {
      toast.error(getWorkerApiErrorMessage(error, "Failed to refresh profile"));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStep1Submit = async (data: WorkerCreatePayload) => {
    setStep1Data(data);
    setKycStep(2);
  };

  const handleKycSubmit = async () => {
    if (!step1Data) return;
    setIsSubmitting(true);

    let coords = { latitude: 0, longitude: 0 };
    try {
      coords = await getCurrentLocation();
    } catch (err: any) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Geolocation failed in development mode, falling back to dummy coordinates:", err);
        coords = { latitude: 19.0760, longitude: 72.8777 }; // Mumbai coordinates fallback
      } else {
        let errorMsg = "Failed to retrieve location. Please enable location permissions to submit your KYC.";
        if (err.code === 1) { // PERMISSION_DENIED
          errorMsg = "Location access denied. You must grant location permission to submit your KYC.";
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errorMsg = "Location information is unavailable.";
        } else if (err.code === 3) { // TIMEOUT
          errorMsg = "Location request timed out. Please try again.";
        } else if (err.message) {
          errorMsg = err.message;
        }
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }
    }

    const payload: WorkerCreatePayload = {
      ...step1Data,
      profile_image: step2Images.profile_image,
      aadhaar_front: step2Images.aadhaar_front,
      aadhaar_back: step2Images.aadhaar_back,
      latitude: coords.latitude,
      longitude: coords.longitude,
      is_available: true,
    };

    try {
      if (workerProfile && (workerProfile.worker_id ?? workerProfile.id)) {
        await updateProfile(payload);
        toast.success("Worker KYC updated successfully");
      } else {
        await createProfile(payload);
        toast.success("Worker KYC created successfully");
      }
      setKycStep(3);
    } catch (error) {
      toast.error(getWorkerApiErrorMessage(error, "Failed to save profile"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    if (!workerProfile) return;
    setStep1Data(workerProfile);
    setStep2Images({
      profile_image: workerProfile.profile_image || "",
      aadhaar_front: workerProfile.aadhaar_front || "",
      aadhaar_back: workerProfile.aadhaar_back || "",
    });
    setKycStep(1);
    setView("edit");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeProfile();
      toast.success("Worker profile deleted");
      setDeleteOpen(false);
      setView("create");
      setKycStep(1);
      setStep1Data(null);
      setStep2Images({
        profile_image: "",
        aadhaar_front: "",
        aadhaar_back: "",
      });
    } catch (error) {
      toast.error(getWorkerApiErrorMessage(error, "Failed to delete profile"));
    } finally {
      setIsDeleting(false);
    }
  };

  const status = (workerProfile?.status || "").toLowerCase();
  const isKycIncomplete = !workerProfile;

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <HardHat className="h-3.5 w-3.5" />
              Worker Portal
            </div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Worker Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Manage your professional worker profile
              {workerAccount?.mobile ? ` · ${workerAccount.mobile}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {isProfileLoading ? (
          <SkeletonCard />
        ) : isKycIncomplete || view === "create" || view === "edit" ? (
          // 3-Step KYC Flow Rendering
          <div className="rounded-xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  {view === "edit" ? "Edit Worker KYC" : "Worker KYC Setup"}
                </h2>
              </div>
              {workerProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setView("view");
                    setKycStep(1);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            <StepIndicator step={kycStep} />

            {kycStep === 1 ? (
              <div>
                <p className="mb-6 text-sm text-gray-600">
                  Step 1: Enter your personal and professional details.
                </p>
                <WorkerForm
                  initialData={step1Data || workerProfile}
                  defaultMobile={workerAccount?.mobile}
                  submitLabel="Continue to Step 2"
                  isSubmitting={false}
                  onSubmit={handleStep1Submit}
                  excludeImages={true}
                  onCancel={workerProfile ? () => setView("view") : undefined}
                />
              </div>
            ) : kycStep === 2 ? (
              <div>
                <p className="mb-6 text-sm text-gray-600">
                  Step 2: Upload your profile picture and Aadhaar Card.
                </p>
                <div className="grid gap-6 sm:grid-cols-3">
                  <CloudinaryUpload
                    label="Profile Photo"
                    value={step2Images.profile_image}
                    onChange={(url) => setStep2Images((prev) => ({ ...prev, profile_image: url }))}
                  />
                  <CloudinaryUpload
                    label="Aadhaar Front"
                    value={step2Images.aadhaar_front}
                    onChange={(url) => setStep2Images((prev) => ({ ...prev, aadhaar_front: url }))}
                  />
                  <CloudinaryUpload
                    label="Aadhaar Back"
                    value={step2Images.aadhaar_back}
                    onChange={(url) => setStep2Images((prev) => ({ ...prev, aadhaar_back: url }))}
                  />
                </div>

                <div className="mt-8 flex gap-3 border-t border-gray-100 pt-6">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setKycStep(1)}
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to Step 1
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleKycSubmit}
                    isLoading={isSubmitting}
                    disabled={
                      !step2Images.profile_image ||
                      !step2Images.aadhaar_front ||
                      !step2Images.aadhaar_back
                    }
                  >
                    Submit KYC
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">KYC Submitted Successfully</h3>
                <p className="mt-2 max-w-md text-sm text-gray-600">
                  Your KYC has been submitted successfully. Your verification is pending admin approval.
                </p>
                <Button
                  className="mt-8 px-8"
                  onClick={() => {
                    setKycStep(1);
                    setView("view");
                    void handleRefresh();
                  }}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        ) : status === "pending" ? (
          // Pending Approval Screen
          <div className="rounded-xl border border-white/40 bg-white/70 p-8 text-center shadow-sm backdrop-blur-md">
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-8 w-8" />
              <span className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Pending Approval</h2>
            <p className="mt-2 text-gray-600 font-medium">Your KYC is under review.</p>
            <p className="mt-1 text-sm text-gray-500 max-w-md mx-auto">
              Please wait while our administrators verify your details and documents.
              This typically takes up to 24-48 hours.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                isLoading={isRefreshing}
              >
                <RefreshCw className="h-4 w-4 animate-spin-slow" />
                Refresh Status
              </Button>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        ) : status === "rejected" ? (
          // Rejected Screen
          <div className="rounded-xl border border-white/40 bg-white/70 p-8 text-center shadow-sm backdrop-blur-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">KYC Rejected</h2>
            {workerProfile?.rejection_reason ? (
              <div className="mt-3 rounded-lg bg-red-50 p-4 border border-red-100 max-w-lg mx-auto">
                <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                <p className="mt-1 text-sm text-red-700">{workerProfile.rejection_reason}</p>
              </div>
            ) : (
              <p className="mt-2 text-gray-600">Your KYC submission was rejected by the administrator.</p>
            )}
            <p className="mt-4 text-sm text-gray-500">
              Please click below to modify your information or re-upload clear copies of your documents.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button size="sm" onClick={handleEditClick}>
                <Pencil className="h-4 w-4" />
                Edit & Re-submit KYC
              </Button>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        ) : (
          // Approved Profile / Normal Dashboard
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={handleEditClick}>
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete Profile
              </Button>
            </div>
            <WorkerProfileCard profile={workerProfile} />
          </>
        )}
      </div>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Worker Profile"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete your worker profile? This action cannot be undone.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setDeleteOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function WorkerDashboardPage() {
  return (
    <WorkerProtectedRoute>
      <WorkerDashboardContent />
    </WorkerProtectedRoute>
  );
}
