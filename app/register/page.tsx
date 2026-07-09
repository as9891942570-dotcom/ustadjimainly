"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { getApiErrorMessage } from "@/lib/axios";
import { UserPlus } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
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
      await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        mobile: data.mobileNumber,
        password: data.password,
        city: data.city,
        address: data.address,
        pincode: data.pincode,
      });
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Registration failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/80 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 p-3 text-white shadow-lg">
              <UserPlus className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-sm text-gray-600">Join ustadji and book services today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="9876543210"
              error={errors.mobileNumber?.message}
              {...register("mobileNumber")}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="City"
              placeholder="Mumbai"
              error={errors.city?.message}
              {...register("city")}
            />
            <Input
              label="Address"
              placeholder="123 Main Street"
              error={errors.address?.message}
              {...register("address")}
            />
            <Input
              label="Pincode"
              placeholder="400001"
              error={errors.pincode?.message}
              {...register("pincode")}
            />
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
