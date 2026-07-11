"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/Input";
import Button from "@/components/Button";
import LocationSelect from "@/components/LocationSelect";
import { fetchSkills } from "@/services/serviceApi";
import {
  WORKER_CATEGORIES,
  WorkerCreatePayload,
  WorkerKycDetails,
  WorkerProfile,
} from "@/types/worker";

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
  skills: z.string().min(1, "Select at least one skill"),
  about: z.string().min(1, "Description is required"),
  aadhaar_number: z
    .string()
    .min(1, "Aadhaar number is required")
    .regex(/^\d{12}$/, "Enter a valid 12-digit Aadhaar number"),
  pan_number: z
    .string()
    .min(1, "PAN number is required")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (e.g. ABCDE1234F)"),
  account_holder_name: z.string().min(1, "Account holder name is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z
    .string()
    .min(1, "Account number is required")
    .regex(/^\d{9,18}$/, "Enter a valid account number (9–18 digits)"),
  ifsc_code: z
    .string()
    .min(1, "IFSC code is required")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
  profile_image: z.string().optional(),
  aadhaar_front: z.string().optional(),
  aadhaar_back: z.string().optional(),
});

export type WorkerFormData = z.infer<typeof workerFormSchema>;

export type WorkerFormSubmitData = {
  profile: WorkerCreatePayload;
  kyc: WorkerKycDetails;
};

interface WorkerFormProps {
  initialData?: WorkerProfile | null;
  defaultMobile?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (data: WorkerFormSubmitData) => Promise<void>;
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

function parseSkills(skills?: string): string[] {
  if (!skills) return [];
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
    pan_number: (profile?.pan_number ?? "").toUpperCase(),
    account_holder_name: profile?.account_holder_name ?? "",
    bank_name: profile?.bank_name ?? "",
    account_number: profile?.account_number ?? "",
    ifsc_code: (profile?.ifsc_code ?? "").toUpperCase(),
    profile_image: profile?.profile_image ?? "",
    aadhaar_front: profile?.aadhaar_front ?? "",
    aadhaar_back: profile?.aadhaar_back ?? "",
  };
}

function capitalizeSkill(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ");
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
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm<WorkerFormData>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: toFormDefaults(initialData, defaultMobile),
  });

  const selectedSkills = parseSkills(watch("skills"));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setSkillsLoading(true);
      try {
        const skills = await fetchSkills();
        if (cancelled) return;
        const names = skills.map((s) => capitalizeSkill(s.skill_name));
        const unique = Array.from(new Set(names));
        const existing = parseSkills(initialData?.skills);
        setSkillOptions(Array.from(new Set([...unique, ...existing])));
      } catch {
        if (!cancelled) {
          setSkillOptions(
            WORKER_CATEGORIES.map((c) => c.label).concat(parseSkills(initialData?.skills))
          );
        }
      } finally {
        if (!cancelled) setSkillsLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [initialData?.skills]);

  const toggleSkill = (skill: string) => {
    const current = parseSkills(watch("skills"));
    const next = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill];
    setValue("skills", next.join(", "), { shouldValidate: true });
  };

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
    const profile: WorkerCreatePayload = {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      gender: data.gender,
      date_of_birth: data.date_of_birth,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      category_id: data.category_id,
      experience_years: data.experience_years,
      skills: data.skills,
      about: data.about,
      aadhaar_number: data.aadhaar_number,
      profile_image: data.profile_image || "",
      aadhaar_front: data.aadhaar_front || "",
      aadhaar_back: data.aadhaar_back || "",
    };

    const kyc: WorkerKycDetails = {
      aadhaar_number: data.aadhaar_number,
      pan_number: data.pan_number.toUpperCase(),
      account_holder_name: data.account_holder_name,
      bank_name: data.bank_name,
      account_number: data.account_number,
      ifsc_code: data.ifsc_code.toUpperCase(),
    };

    await onSubmit({ profile, kyc });
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

      <Controller
        name="state"
        control={control}
        render={({ field: stateField }) => (
          <Controller
            name="city"
            control={control}
            render={({ field: cityField }) => (
              <LocationSelect
                state={stateField.value}
                city={cityField.value}
                onStateChange={stateField.onChange}
                onCityChange={cityField.onChange}
                stateError={errors.state?.message}
                cityError={errors.city?.message}
              />
            )}
          />
        )}
      />

      <Input label="Pincode" error={errors.pincode?.message} {...register("pincode")} />

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

      <div className="w-full">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Skills</label>
        {skillsLoading ? (
          <p className="text-sm text-gray-500">Loading skills...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {skillOptions.map((skill) => {
              const checked = selectedSkills.includes(skill);
              return (
                <label
                  key={skill}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-gray-200 bg-white/80 text-gray-700 hover:border-emerald-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    checked={checked}
                    onChange={() => toggleSkill(skill)}
                  />
                  {skill}
                </label>
              );
            })}
          </div>
        )}
        {errors.skills && <p className="mt-1.5 text-sm text-red-500">{errors.skills.message}</p>}
      </div>

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

      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Identity & Bank Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Aadhaar Number"
            placeholder="12-digit Aadhaar"
            error={errors.aadhaar_number?.message}
            {...register("aadhaar_number")}
          />
          <Input
            label="PAN Number"
            placeholder="ABCDE1234F"
            className="uppercase"
            error={errors.pan_number?.message}
            {...register("pan_number", {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Account Holder Name"
            error={errors.account_holder_name?.message}
            {...register("account_holder_name")}
          />
          <Input
            label="Bank Name"
            error={errors.bank_name?.message}
            {...register("bank_name")}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Account Number"
            error={errors.account_number?.message}
            {...register("account_number")}
          />
          <Input
            label="IFSC Code"
            placeholder="SBIN0001234"
            className="uppercase"
            error={errors.ifsc_code?.message}
            {...register("ifsc_code", {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
        </div>
      </div>

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
