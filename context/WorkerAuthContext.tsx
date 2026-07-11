"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  clearWorkerAuthStorage,
  getStoredWorkerProfileId,
  getStoredWorkerUser,
  getWorkerToken,
  removeStoredWorkerProfileId,
  setStoredWorkerProfileId,
  setStoredWorkerUser,
  setWorkerToken,
} from "@/lib/workerAuth";
import {
  createWorkerProfile,
  deleteWorkerProfile,
  getLoggedInWorkerProfile,
  getWorkerKyc,
  submitWorkerKyc,
  updateWorkerProfile,
  workerLogin,
  workerLogout,
  workerRegister,
} from "@/services/workerApi";
import {
  WorkerAccount,
  WorkerCreatePayload,
  WorkerKycPayload,
  WorkerKycRecord,
  WorkerLoginPayload,
  WorkerProfile,
  WorkerRegisterPayload,
  getWorkerId,
} from "@/types/worker";

interface WorkerAuthContextValue {
  workerAccount: WorkerAccount | null;
  workerProfile: WorkerProfile | null;
  workerKyc: WorkerKycRecord | null;
  isWorkerAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  login: (payload: WorkerLoginPayload) => Promise<void>;
  register: (payload: WorkerRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<WorkerProfile | null>;
  refreshKyc: () => Promise<WorkerKycRecord | null>;
  createProfile: (payload: WorkerCreatePayload) => Promise<WorkerProfile>;
  updateProfile: (payload: WorkerCreatePayload) => Promise<WorkerProfile>;
  removeProfile: () => Promise<void>;
  submitKyc: (payload: Omit<WorkerKycPayload, "worker_id"> & { worker_id?: number }) => Promise<unknown>;
}

const WorkerAuthContext = createContext<WorkerAuthContextValue | undefined>(
  undefined
);

export function WorkerAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [workerAccount, setWorkerAccount] = useState<WorkerAccount | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [workerKyc, setWorkerKyc] = useState<WorkerKycRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const loadKyc = useCallback(async (workerId: number | null | undefined) => {
    if (!workerId) {
      setWorkerKyc(null);
      return null;
    }
    try {
      const kyc = await getWorkerKyc(workerId);
      setWorkerKyc(kyc);
      if (kyc?.kyc_status) {
        setWorkerProfile((prev) =>
          prev
            ? {
                ...prev,
                kyc_status: kyc.kyc_status,
                // Prefer KYC approval status for dashboard gating
                status: kyc.kyc_status || prev.status,
                pan_number: kyc.pan_number ?? prev.pan_number,
                account_holder_name: kyc.account_holder_name ?? prev.account_holder_name,
                bank_name: kyc.bank_name ?? prev.bank_name,
                account_number: kyc.account_number ?? prev.account_number,
                ifsc_code: kyc.ifsc_code ?? prev.ifsc_code,
                pan_card_image: kyc.pan_card_image ?? prev.pan_card_image,
                passbook_image: kyc.passbook_image ?? prev.passbook_image,
                selfie_image: kyc.selfie_image ?? prev.selfie_image,
                aadhaar_front: kyc.aadhaar_front ?? prev.aadhaar_front,
                aadhaar_back: kyc.aadhaar_back ?? prev.aadhaar_back,
                aadhaar_number: kyc.aadhaar_number || prev.aadhaar_number,
              }
            : prev
        );
      }
      return kyc;
    } catch {
      setWorkerKyc(null);
      return null;
    }
  }, []);

  const loadProfile = useCallback(async (account: WorkerAccount) => {
    setIsProfileLoading(true);
    try {
      const storedId = getStoredWorkerProfileId();
      const profile = await getLoggedInWorkerProfile(account.mobile, storedId);
      setWorkerProfile(profile);

      const workerId = getWorkerId(profile);
      if (workerId) {
        setStoredWorkerProfileId(workerId);
        setWorkerAccount({ ...account, worker_id: workerId });
        setStoredWorkerUser({ ...account, worker_id: workerId });
        await loadKyc(workerId);
      } else {
        setWorkerKyc(null);
      }

      return profile;
    } catch {
      setWorkerProfile(null);
      setWorkerKyc(null);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  }, [loadKyc]);

  const refreshProfile = useCallback(async () => {
    if (!workerAccount) return null;
    return loadProfile(workerAccount);
  }, [workerAccount, loadProfile]);

  const refreshKyc = useCallback(async () => {
    const workerId =
      getWorkerId(workerProfile) ??
      getStoredWorkerProfileId() ??
      workerAccount?.worker_id ??
      null;
    return loadKyc(workerId);
  }, [workerProfile, workerAccount, loadKyc]);

  useEffect(() => {
    const init = async () => {
      const token = getWorkerToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const stored = getStoredWorkerUser();
      if (stored) {
        setWorkerAccount(stored);
        await loadProfile(stored);
      }

      setIsLoading(false);
    };

    init();
  }, [loadProfile]);

  const login = useCallback(
    async (payload: WorkerLoginPayload) => {
      const data = await workerLogin(payload);
      setWorkerToken(String(data.user_id));

      const account: WorkerAccount = {
        user_id: data.user_id,
        mobile: payload.mobile,
      };

      setWorkerAccount(account);
      setStoredWorkerUser(account);
      await loadProfile(account);
    },
    [loadProfile]
  );

  const register = useCallback(async (payload: WorkerRegisterPayload) => {
    await workerRegister(payload);
  }, []);

  const logout = useCallback(async () => {
    const userId = workerAccount?.user_id;
    if (userId) {
      try {
        await workerLogout(userId);
      } catch {
        /* proceed with local logout */
      }
    }
    clearWorkerAuthStorage();
    setWorkerAccount(null);
    setWorkerProfile(null);
    setWorkerKyc(null);
    router.push("/worker/login");
  }, [workerAccount, router]);

  const createProfile = useCallback(
    async (payload: WorkerCreatePayload) => {
      const profile = await createWorkerProfile(payload);
      const workerId = getWorkerId(profile);

      if (workerId) {
        setStoredWorkerProfileId(workerId);
      }

      setWorkerProfile(profile);

      if (workerAccount) {
        const updated = { ...workerAccount, worker_id: workerId ?? undefined };
        setWorkerAccount(updated);
        setStoredWorkerUser(updated);
      }

      if (workerId) {
        await loadKyc(workerId);
      }

      return profile;
    },
    [workerAccount, loadKyc]
  );

  const updateProfileHandler = useCallback(
    async (payload: WorkerCreatePayload) => {
      const workerId = getWorkerId(workerProfile) ?? getStoredWorkerProfileId();
      if (!workerId) {
        throw new Error("Worker profile ID not found");
      }

      const profile = await updateWorkerProfile(workerId, payload);
      setWorkerProfile(profile);
      await loadKyc(workerId);
      return profile;
    },
    [workerProfile, loadKyc]
  );

  const removeProfile = useCallback(async () => {
    const workerId = getWorkerId(workerProfile) ?? getStoredWorkerProfileId();
    if (!workerId) {
      throw new Error("Worker profile ID not found");
    }

    await deleteWorkerProfile(workerId);
    setWorkerProfile(null);
    setWorkerKyc(null);
    removeStoredWorkerProfileId();

    if (workerAccount) {
      const updated = { ...workerAccount, worker_id: undefined };
      setWorkerAccount(updated);
      setStoredWorkerUser(updated);
    }
  }, [workerProfile, workerAccount]);

  const submitKyc = useCallback(
    async (payload: Omit<WorkerKycPayload, "worker_id"> & { worker_id?: number }) => {
      const workerId =
        payload.worker_id ??
        getWorkerId(workerProfile) ??
        getStoredWorkerProfileId() ??
        workerAccount?.worker_id;

      if (!workerId) {
        throw new Error("Worker ID not found. Create your profile before submitting KYC.");
      }

      const result = await submitWorkerKyc({
        ...payload,
        worker_id: workerId,
      });
      await loadKyc(workerId);
      return result;
    },
    [workerProfile, workerAccount, loadKyc]
  );

  const value = useMemo(
    () => ({
      workerAccount,
      workerProfile,
      workerKyc,
      isWorkerAuthenticated: !!workerAccount,
      isLoading,
      isProfileLoading,
      login,
      register,
      logout,
      refreshProfile,
      refreshKyc,
      createProfile,
      updateProfile: updateProfileHandler,
      removeProfile,
      submitKyc,
    }),
    [
      workerAccount,
      workerProfile,
      workerKyc,
      isLoading,
      isProfileLoading,
      login,
      register,
      logout,
      refreshProfile,
      refreshKyc,
      createProfile,
      updateProfileHandler,
      removeProfile,
      submitKyc,
    ]
  );

  return (
    <WorkerAuthContext.Provider value={value}>{children}</WorkerAuthContext.Provider>
  );
}

export function useWorkerAuth() {
  const context = useContext(WorkerAuthContext);
  if (!context) {
    throw new Error("useWorkerAuth must be used within WorkerAuthProvider");
  }
  return context;
}

export { getWorkerApiErrorMessage } from "@/services/workerApi";
