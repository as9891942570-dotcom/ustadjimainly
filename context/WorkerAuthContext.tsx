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
  updateWorkerProfile,
  workerLogin,
  workerLogout,
  workerRegister,
} from "@/services/workerApi";
import {
  WorkerAccount,
  WorkerCreatePayload,
  WorkerLoginPayload,
  WorkerProfile,
  WorkerRegisterPayload,
  getWorkerId,
} from "@/types/worker";

interface WorkerAuthContextValue {
  workerAccount: WorkerAccount | null;
  workerProfile: WorkerProfile | null;
  isWorkerAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  login: (payload: WorkerLoginPayload) => Promise<void>;
  register: (payload: WorkerRegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<WorkerProfile | null>;
  createProfile: (payload: WorkerCreatePayload) => Promise<WorkerProfile>;
  updateProfile: (payload: WorkerCreatePayload) => Promise<WorkerProfile>;
  removeProfile: () => Promise<void>;
}

const WorkerAuthContext = createContext<WorkerAuthContextValue | undefined>(
  undefined
);

export function WorkerAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [workerAccount, setWorkerAccount] = useState<WorkerAccount | null>(null);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

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
      }

      return profile;
    } catch {
      setWorkerProfile(null);
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!workerAccount) return null;
    return loadProfile(workerAccount);
  }, [workerAccount, loadProfile]);

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

      return profile;
    },
    [workerAccount]
  );

  const updateProfileHandler = useCallback(
    async (payload: WorkerCreatePayload) => {
      const workerId = getWorkerId(workerProfile) ?? getStoredWorkerProfileId();
      if (!workerId) {
        throw new Error("Worker profile ID not found");
      }

      const profile = await updateWorkerProfile(workerId, payload);
      setWorkerProfile(profile);
      return profile;
    },
    [workerProfile]
  );

  const removeProfile = useCallback(async () => {
    const workerId = getWorkerId(workerProfile) ?? getStoredWorkerProfileId();
    if (!workerId) {
      throw new Error("Worker profile ID not found");
    }

    await deleteWorkerProfile(workerId);
    setWorkerProfile(null);
    removeStoredWorkerProfileId();

    if (workerAccount) {
      const updated = { ...workerAccount, worker_id: undefined };
      setWorkerAccount(updated);
      setStoredWorkerUser(updated);
    }
  }, [workerProfile, workerAccount]);

  const value = useMemo(
    () => ({
      workerAccount,
      workerProfile,
      isWorkerAuthenticated: !!workerAccount,
      isLoading,
      isProfileLoading,
      login,
      register,
      logout,
      refreshProfile,
      createProfile,
      updateProfile: updateProfileHandler,
      removeProfile,
    }),
    [
      workerAccount,
      workerProfile,
      isLoading,
      isProfileLoading,
      login,
      register,
      logout,
      refreshProfile,
      createProfile,
      updateProfileHandler,
      removeProfile,
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
