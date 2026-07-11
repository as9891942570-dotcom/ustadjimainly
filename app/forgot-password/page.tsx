"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { getApiErrorMessage } from "@/lib/axios";
import axios from "axios";

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const identifierSchema = z.object({
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
});

const resetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type IdentifierFormData = z.infer<typeof identifierSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [mobile, setMobile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const identifierForm = useForm<IdentifierFormData>({
    resolver: zodResolver(identifierSchema),
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onRequestSubmit = async (data: IdentifierFormData) => {
    setIsSubmitting(true);
    try {
      await forgotPassword({ mobile: data.mobile });
      setMobile(data.mobile);
      setStep("reset");
      toast.success("Verification successful. Set your new password.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error(
          "Password recovery is not available right now. Please contact support with your registered mobile number."
        );
      } else {
        toast.error(
          getApiErrorMessage(
            error,
            "No account found for this mobile number. Please check and try again."
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);
    try {
      await resetPassword({
        mobile,
        password: data.password,
      });
      toast.success("Password reset successful! Please login.");
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        toast.error(
          "Password reset is not available right now. Please contact support."
        );
      } else {
        toast.error(getApiErrorMessage(error, "Failed to reset password"));
      }
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
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === "request" ? "Forgot Password" : "Reset Password"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {step === "request"
                ? "Enter your registered mobile number to recover your password"
                : `Create a new password for ${mobile}`}
            </p>
          </div>

          {step === "request" ? (
            <form
              onSubmit={identifierForm.handleSubmit(onRequestSubmit)}
              className="space-y-5"
            >
              <Input
                label="Mobile Number"
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                error={identifierForm.formState.errors.mobile?.message}
                {...identifierForm.register("mobile")}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Continue
              </Button>
            </form>
          ) : (
            <form
              onSubmit={resetForm.handleSubmit(onResetSubmit)}
              className="space-y-5"
            >
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 6 characters"
                error={resetForm.formState.errors.password?.message}
                {...resetForm.register("password")}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                error={resetForm.formState.errors.confirmPassword?.message}
                {...resetForm.register("confirmPassword")}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Reset Password
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("request")}
              >
                Back
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Login
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            Need help?{" "}
            <Link href="/support" className="font-semibold text-emerald-700 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
