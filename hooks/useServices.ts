"use client";

import { useCallback, useEffect, useState } from "react";
import { Service } from "@/types/service";
import {
  fetchServices,
  getServiceApiErrorMessage,
} from "@/services/serviceApi";

interface UseServicesResult {
  services: Service[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchServices();
      setServices(data);
    } catch (err) {
      setServices([]);
      setError(getServiceApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    error,
    isEmpty: !loading && !error && services.length === 0,
    refetch: loadServices,
  };
}
