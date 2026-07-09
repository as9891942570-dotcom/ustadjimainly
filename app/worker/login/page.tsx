"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  getWorkerApiErrorMessage,
  useWorkerAuth,
} from "@/context/WorkerAuthContext";

const loginSchema = z.object({
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function WorkerLoginPage() {
  const { login } = useWorkerAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login({ mobile: data.mobile, password: data.password });
      toast.success("Worker login successful!");
      router.push("/worker/dashboard");
    } catch (error) {
      toast.error(getWorkerApiErrorMessage(error, "Invalid mobile number or password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 p-3 text-white shadow-lg">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Worker Login</h1>
            <p className="mt-2 text-sm text-gray-600">Sign in to manage your worker profile</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="9876543210"
              error={errors.mobile?.message}
              {...register("mobile")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            New worker?{" "}
            <Link href="/worker/register" className="font-semibold text-emerald-700 hover:underline">
              Register
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Customer?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Customer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
