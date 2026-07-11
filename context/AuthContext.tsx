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
import api from "@/lib/axios";
import {
  clearAuthStorage,
  getStoredUser,
  getToken,
  mapApiCustomerToUser,
  setStoredUser,
  setToken,
} from "@/lib/auth";
import {
  ApiCustomer,
  AuthMessageResponse,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  User,
} from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUser = useCallback(async (userId: number, extras?: Partial<User>) => {
    const { data } = await api.get<ApiCustomer>(`/auth/customers/${userId}`);
    const mapped = mapApiCustomerToUser(data, extras);
    setUser(mapped);
    setStoredUser(mapped);
    return mapped;
  }, []);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;

    const userId = parseInt(token, 10);
    if (Number.isNaN(userId)) {
      clearAuthStorage();
      return null;
    }

    try {
      const stored = getStoredUser();
      return await fetchAndSetUser(userId, stored ?? undefined);
    } catch {
      clearAuthStorage();
      setUser(null);
      return null;
    }
  }, [fetchAndSetUser]);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const stored = getStoredUser();
      if (stored) setUser(stored);

      try {
        await getCurrentUser();
      } catch {
        clearAuthStorage();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [getCurrentUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post<LoginResponse>("/auth/login", payload);
      setToken(String(data.user_id));

      const stored = getStoredUser();
      const profileExtras: Partial<User> | undefined =
        stored?.id === data.user_id
          ? stored
          : stored?.mobile === payload.mobile
            ? stored
            : undefined;

      try {
        await fetchAndSetUser(data.user_id, profileExtras);
      } catch {
        const fallbackUser: User = {
          id: data.user_id,
          firstName: profileExtras?.firstName ?? "User",
          lastName: profileExtras?.lastName ?? "",
          mobile: payload.mobile,
          city: profileExtras?.city ?? "",
          address: profileExtras?.address ?? "",
          pincode: profileExtras?.pincode ?? "",
        };
        setUser(fallbackUser);
        setStoredUser(fallbackUser);
      }
    },
    [fetchAndSetUser]
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    const { state, ...apiPayload } = payload;
    void state;
    const { data } = await api.post<RegisterResponse>("/auth/register", apiPayload);

    const newUser: User = {
      id: data.id,
      firstName: payload.first_name,
      lastName: payload.last_name,
      mobile: payload.mobile,
      city: payload.city,
      state: payload.state,
      address: payload.address,
      pincode: payload.pincode,
    };

    setStoredUser(newUser);
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    await api.post<AuthMessageResponse>("/auth/forgot-password", payload);
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    await api.post<AuthMessageResponse>("/auth/reset-password", payload);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    router.push("/");
  }, [router]);

  const updateUser = useCallback((updated: User) => {
    setUser(updated);
    setStoredUser(updated);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      getCurrentUser,
      updateUser,
    }),
    [
      user,
      isLoading,
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      getCurrentUser,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
