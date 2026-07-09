"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import api, { getApiErrorMessage } from "@/lib/axios";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const serviceOptions = [
  "Mistri",
  "Labour",
  "Plumber",
  "Electrician",
  "Woodworker",
  "Painter",
  "Carpenter",
  "Cleaner",
  "Other",
];

export default function ContactPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    if (!isAuthenticated || !user) {
      toast.info("Please login to submit a service request");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const workerType = data.service === "Other" ? "Mistri" : data.service;
      const problem = `[Contact from ${data.name}, Phone: ${data.phone}] ${data.message}`;

      await api.post(`/auth/request-service/${user.id}`, {
        worker_type: workerType,
        problem,
      });

      toast.success("Your request has been submitted successfully!");
      reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit request"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-gray-600">
            Have a question or need help? We&apos;re here for you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-md">
              <h2 className="mb-6 text-lg font-bold text-gray-900">Get in Touch</h2>
              <div className="space-y-5">
                <a
                  href="mailto:hd674552@gmail.com"
                  className="flex items-start gap-4 rounded-lg p-3 transition hover:bg-emerald-50"
                >
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">hd674552@gmail.com</p>
                  </div>
                </a>
                <a
                  href="tel:+917042292044"
                  className="flex items-start gap-4 rounded-lg p-3 transition hover:bg-emerald-50"
                >
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">+91 7042292044</p>
                  </div>
                </a>
                <div className="flex items-start gap-4 rounded-lg p-3">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Service Area</p>
                    <p className="font-semibold text-gray-900">Pan India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-xl border border-white/40 bg-white/80 p-8 shadow-xl shadow-emerald-500/5 backdrop-blur-md">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Submit Request</h2>
              </div>

              {!isAuthenticated && (
                <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Please{" "}
                  <a href="/login" className="font-semibold underline">
                    login
                  </a>{" "}
                  to submit a service request via our platform.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Name"
                    placeholder="Your name"
                    error={errors.name?.message}
                    {...register("name")}
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    placeholder="9876543210"
                    error={errors.phone?.message}
                    {...register("phone")}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Service
                  </label>
                  <select
                    className={`w-full rounded-xl border bg-white/80 px-4 py-2.5 text-gray-900 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      errors.service ? "border-red-400" : "border-gray-200"
                    }`}
                    {...register("service")}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {serviceOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.service.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your requirements..."
                    className={`w-full rounded-xl border bg-white/80 px-4 py-2.5 text-gray-900 transition placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                      errors.message ? "border-red-400" : "border-gray-200"
                    }`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
                  Submit Request
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
