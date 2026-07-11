"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileCard from "@/components/ProfileCard";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import LocationSelect from "@/components/LocationSelect";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/user";
import { LogOut, Headphones, MapPin, Pencil, User as UserIcon } from "lucide-react";

const editSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobile: z
    .string()
    .min(1, "Mobile is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type EditFormData = z.infer<typeof editSchema>;

function ProfileContent() {
  const { user, logout, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    values: user
      ? {
          firstName: user.firstName || (user.name ? user.name.trim().split(/\s+/)[0] : "") || "",
          lastName: user.lastName || (user.name ? user.name.trim().split(/\s+/).slice(1).join(" ") : "") || "",
          mobile: user.mobile || "",
          state: user.state || "",
          city: user.city || "",
          address: user.address || "",
          pincode: user.pincode || "",
        }
      : undefined,
  });

  if (!user) return null;

  const onEditSubmit = (data: EditFormData) => {
    const updated: User = {
      ...user,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`.trim(),
      mobile: data.mobile,
      state: data.state,
      city: data.city,
      address: data.address,
      pincode: data.pincode,
    };
    updateUser(updated);
    toast.success("Profile updated successfully");
    setEditOpen(false);
  };

  const openEdit = () => {
    reset({
      firstName: user.firstName || (user.name ? user.name.trim().split(/\s+/)[0] : "") || "",
      lastName: user.lastName || (user.name ? user.name.trim().split(/\s+/).slice(1).join(" ") : "") || "",
      mobile: user.mobile || "",
      state: user.state || "",
      city: user.city || "",
      address: user.address || "",
      pincode: user.pincode || "",
    });
    setEditOpen(true);
  };

  const infoRows = [
    { label: "First Name", value: user.firstName || (user.name ? user.name.trim().split(/\s+/)[0] : "") || "—" },
    { label: "Last Name", value: user.lastName || (user.name ? user.name.trim().split(/\s+/).slice(1).join(" ") : "") || "—" },
    { label: "Mobile", value: user.mobile || "—" },
    { label: "State", value: user.state || "—" },
    { label: "City", value: user.city || "—" },
  ];

  const addressRows = [
    { label: "Address", value: user.address || "—" },
    { label: "Pincode", value: user.pincode || "—" },
  ];

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Profile</h1>
            <p className="mt-1 text-gray-600">Manage your account information</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={openEdit}>
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <ProfileCard user={user} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900">Personal Information</h2>
            </div>
            <dl className="space-y-3">
              {infoRows.map((row) => (
                <div key={row.label} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
                  <dt className="text-sm text-gray-500">{row.label}</dt>
                  <dd className="text-sm font-medium text-gray-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              <h2 className="font-bold text-gray-900">Address Information</h2>
            </div>
            <dl className="space-y-3">
              {addressRows.map((row) => (
                <div key={row.label} className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
                  <dt className="text-sm text-gray-500">{row.label}</dt>
                  <dd className="max-w-[60%] text-right text-sm font-medium text-gray-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Customer Support</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Need help with bookings, payments, or your account?
                </p>
              </div>
            </div>
            <Link href="/support">
              <Button variant="secondary" size="sm">
                Get Support
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First Name" error={errors.firstName?.message} {...register("firstName")} />
            <Input label="Last Name" error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <Input label="Mobile" error={errors.mobile?.message} {...register("mobile")} />
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
          <Input label="Address" error={errors.address?.message} {...register("address")} />
          <Input label="Pincode" error={errors.pincode?.message} {...register("pincode")} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
