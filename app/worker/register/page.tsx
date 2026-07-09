"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import {
  getWorkerApiErrorMessage,
  useWorkerAuth,
} from "@/context/WorkerAuthContext";

const registerSchema = z.object({
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function WorkerRegisterPage() {
  const { register: registerWorker } = useWorkerAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerWorker({ mobile: data.mobile, password: data.password });
      toast.success("Registration successful! Please login.");
      router.push("/worker/login");
    } catch (error) {
      toast.error(getWorkerApiErrorMessage(error, "Registration failed"));
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
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Worker Registration</h1>
            <p className="mt-2 text-sm text-gray-600">Create your worker account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="Min. 6 characters"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create Worker Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already registered?{" "}
            <Link href="/worker/login" className="font-semibold text-emerald-700 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
