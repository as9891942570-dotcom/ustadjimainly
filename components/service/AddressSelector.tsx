"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import LocationSelect from "@/components/LocationSelect";
import { useAuth } from "@/context/AuthContext";
import { useServiceBooking } from "@/context/ServiceBookingContext";
import {
  BookingAddress,
  getAddressesStorageKey,
} from "@/types/booking";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(1, "Address is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type AddressFormData = z.infer<typeof addressSchema>;

function loadAddresses(userId?: number | null): BookingAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getAddressesStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as BookingAddress[];
  } catch {
    return [];
  }
}

function saveAddresses(addresses: BookingAddress[], userId?: number | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getAddressesStorageKey(userId), JSON.stringify(addresses));
  } catch {
    /* storage unavailable */
  }
}

function createAddressId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `addr-${crypto.randomUUID()}`;
  }
  return `addr-${Math.random().toString(36).slice(2, 11)}`;
}

function createAddressFromUser(user?: {
  firstName?: string;
  lastName?: string;
  name?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
} | null): BookingAddress {
  let firstName = user?.firstName ?? "";
  let lastName = user?.lastName ?? "";
  if (!firstName && !lastName && user?.name) {
    const parts = user.name.trim().split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ") ?? "";
  }
  return {
    id: "profile-default",
    fullName: `${firstName} ${lastName}`.trim() || user?.name || "-",
    phone: user?.mobile ?? "-",
    address: user?.address ?? "-",
    city: user?.city ?? "-",
    state: user?.state ?? "",
    pincode: user?.pincode ?? "-",
  };
}

export default function AddressSelector() {
  const { user } = useAuth();
  const { selectedAddress, setSelectedAddress, nextStep, prevStep } =
    useServiceBooking();
  const [savedAddresses, setSavedAddresses] = useState<BookingAddress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setSavedAddresses(loadAddresses(user?.id));
  }, [user?.id]);

  const addresses = useMemo(() => {
    if (savedAddresses.length > 0) return savedAddresses;
    if (user?.address && user.city && user.pincode) {
      return [createAddressFromUser(user)];
    }
    return [];
  }, [savedAddresses, user]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { state: "", city: "" },
  });

  const persist = useCallback(
    (next: BookingAddress[]) => {
      setSavedAddresses(next);
      saveAddresses(next, user?.id);
    },
    [user?.id]
  );

  const openAdd = () => {
    setEditingId(null);
    reset({
      fullName: "",
      phone: user?.mobile ?? "",
      address: "",
      state: user?.state ?? "",
      city: user?.city ?? "",
      pincode: "",
    });
    setModalOpen(true);
  };

  const openEdit = (addr: BookingAddress) => {
    setEditingId(addr.id);
    reset({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      state: addr.state ?? "",
      city: addr.city,
      pincode: addr.pincode,
    });
    setModalOpen(true);
  };

  const onSubmit = (data: AddressFormData) => {
    if (editingId) {
      const next = (savedAddresses.length ? savedAddresses : addresses).map((a) => {
        if (a.id !== editingId) return a;
        const id = a.id === "profile-default" ? createAddressId() : a.id;
        return { ...a, ...data, id };
      });
      const persisted = next.filter((a) => a.id !== "profile-default");
      persist(persisted);
      const updated = persisted.find((a) => a.fullName === data.fullName && a.phone === data.phone) ?? persisted[0] ?? null;
      if (selectedAddress?.id === editingId || selectedAddress?.id === "profile-default") {
        setSelectedAddress(updated);
      }
    } else {
      const newAddr: BookingAddress = { id: createAddressId(), ...data };
      persist([...(savedAddresses.length ? savedAddresses : []), newAddr]);
      setSelectedAddress(newAddr);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = savedAddresses.filter((a) => a.id !== id);
    persist(next);
    if (selectedAddress?.id === id) setSelectedAddress(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select Address</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose where the professional should arrive
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-10 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
          <p className="font-medium text-gray-700">No saved addresses</p>
          <Button size="sm" className="mt-4" onClick={openAdd}>
            Add Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const selected = selectedAddress?.id === addr.id;
            return (
              <div
                key={addr.id}
                className={`rounded-xl border p-4 transition ${
                  selected
                    ? "border-emerald-500 bg-emerald-50/60"
                    : "border-gray-100 bg-white hover:border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    className="flex flex-1 items-start gap-3 text-left"
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{addr.fullName}</p>
                      <p className="text-sm text-gray-600">{addr.phone}</p>
                      <p className="mt-1 text-sm text-gray-600">
                        {addr.address}, {addr.city}
                        {addr.state ? `, ${addr.state}` : ""} - {addr.pincode}
                      </p>
                    </div>
                  </button>
                  {addr.id !== "profile-default" && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        onClick={() => openEdit(addr)}
                        aria-label="Edit address"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(addr.id)}
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={prevStep}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={!selectedAddress}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Address" : "Add Address"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Phone"
            type="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Address"
            error={errors.address?.message}
            {...register("address")}
          />
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
          <Input
            label="Pincode"
            error={errors.pincode?.message}
            {...register("pincode")}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              className="flex-1"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingId ? "Save Changes" : "Add Address"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
