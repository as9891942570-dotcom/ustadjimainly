"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { WORKER_CATEGORIES, WorkerCreatePayload, WorkerProfile } from "@/types/worker";

const workerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  mobile: z
    .string()
    .min(1, "Mobile is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  gender: z.string().min(1, "Gender is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  category_id: z.number().min(1, "Select a work category"),
  experience_years: z
    .number()
    .min(0, "Experience cannot be negative")
    .max(60, "Enter a valid experience"),
  skills: z.string().min(1, "Skills are required"),
  about: z.string().min(1, "Description is required"),
  aadhaar_number: z
    .string()
    .min(1, "Aadhaar number is required")
    .regex(/^\d{12}$/, "Enter a valid 12-digit Aadhaar number"),
  profile_image: z.string().optional(),
  aadhaar_front: z.string().optional(),
  aadhaar_back: z.string().optional(),
});

export type WorkerFormData = z.infer<typeof workerFormSchema>;

interface WorkerFormProps {
  initialData?: WorkerProfile | null;
  defaultMobile?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (data: WorkerCreatePayload) => Promise<void>;
  onCancel?: () => void;
  excludeImages?: boolean;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toFormDefaults(
  profile?: WorkerProfile | null,
  defaultMobile?: string
): WorkerFormData {
  return {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    mobile: profile?.mobile ?? defaultMobile ?? "",
    gender: profile?.gender ?? "",
    date_of_birth: profile?.date_of_birth ?? "",
    address: profile?.address ?? "",
    city: profile?.city ?? "",
    state: profile?.state ?? "",
    pincode: profile?.pincode ?? "",
    category_id: profile?.category_id ?? 1,
    experience_years: profile?.experience_years ?? 0,
    skills: profile?.skills ?? "",
    about: profile?.about ?? "",
    aadhaar_number: profile?.aadhaar_number ?? "",
    profile_image: profile?.profile_image ?? "",
    aadhaar_front: profile?.aadhaar_front ?? "",
    aadhaar_back: profile?.aadhaar_back ?? "",
  };
}

export default function WorkerForm({
  initialData,
  defaultMobile,
  submitLabel = "Save Profile",
  isSubmitting = false,
  onSubmit,
  onCancel,
  excludeImages = false,
}: WorkerFormProps) {
  const [imagePreview, setImagePreview] = useState(initialData?.profile_image ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: toFormDefaults(initialData, defaultMobile),
  });

  const handleImageChange = async (
    field: "profile_image" | "aadhaar_front" | "aadhaar_back",
    file: File | undefined
  ) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    setValue(field, base64, { shouldValidate: true });
    if (field === "profile_image") {
      setImagePreview(base64);
    }
  };

  const submitHandler = async (data: WorkerFormData) => {
    const payload: WorkerCreatePayload = {
      ...data,
      profile_image: data.profile_image || "",
      aadhaar_front: data.aadhaar_front || "",
      aadhaar_back: data.aadhaar_back || "",
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name" error={errors.name?.message} {...register("name")} />
        <Input
          label="Mobile"
          type="tel"
          error={errors.mobile?.message}
          {...register("mobile")}
        />
      </div>

      <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="w-full">
          <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            id="gender"
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            {...register("gender")}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1.5 text-sm text-red-500">{errors.gender.message}</p>
          )}
        </div>
        <Input
          label="Date of Birth"
          type="date"
          error={errors.date_of_birth?.message}
          {...register("date_of_birth")}
        />
      </div>

      <Input label="Address" error={errors.address?.message} {...register("address")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="City" error={errors.city?.message} {...register("city")} />
        <Input label="State" error={errors.state?.message} {...register("state")} />
        <Input label="Pincode" error={errors.pincode?.message} {...register("pincode")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="w-full">
          <label
            htmlFor="category_id"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Work Category
          </label>
          <select
            id="category_id"
            className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            {...register("category_id", { valueAsNumber: true })}
          >
            {WORKER_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1.5 text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>
        <Input
          label="Experience (years)"
          type="number"
          min={0}
          error={errors.experience_years?.message}
          {...register("experience_years", { valueAsNumber: true })}
        />
      </div>

      <Input label="Skills" placeholder="Plumbing, Electrical, etc." error={errors.skills?.message} {...register("skills")} />

      <div className="w-full">
        <label htmlFor="about" className="mb-1.5 block text-sm font-medium text-gray-700">
          About / Description
        </label>
        <textarea
          id="about"
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          {...register("about")}
        />
        {errors.about && <p className="mt-1.5 text-sm text-red-500">{errors.about.message}</p>}
      </div>

      <Input
        label="Aadhaar Number"
        placeholder="12-digit Aadhaar"
        error={errors.aadhaar_number?.message}
        {...register("aadhaar_number")}
      />

      {!excludeImages && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-600"
              onChange={(e) => handleImageChange("profile_image", e.target.files?.[0])}
            />
            {imagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Profile preview"
                className="mt-2 h-20 w-20 rounded-xl object-cover"
              />
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Aadhaar Front</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-600"
              onChange={(e) => handleImageChange("aadhaar_front", e.target.files?.[0])}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Aadhaar Back</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-gray-600"
              onChange={(e) => handleImageChange("aadhaar_back", e.target.files?.[0])}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
