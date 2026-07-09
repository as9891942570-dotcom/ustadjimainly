"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkerAuth } from "@/context/WorkerAuthContext";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "./Loader";

interface WorkerProtectedRouteProps {
  children: React.ReactNode;
}

export default function WorkerProtectedRoute({ children }: WorkerProtectedRouteProps) {
  const { isWorkerAuthenticated, isLoading: isWorkerLoading } = useWorkerAuth();
  const { isAuthenticated: isCustomerAuthenticated, isLoading: isCustomerLoading } = useAuth();
  const router = useRouter();

  const isLoading = isWorkerLoading || isCustomerLoading;

  useEffect(() => {
    if (!isLoading) {
      if (isCustomerAuthenticated) {
        router.replace("/dashboard");
      } else if (!isWorkerAuthenticated) {
        router.replace("/worker/login");
      }
    }
  }, [isWorkerAuthenticated, isCustomerAuthenticated, isLoading, router]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isCustomerAuthenticated || !isWorkerAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
