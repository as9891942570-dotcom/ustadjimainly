"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import { useAuth } from "@/context/AuthContext";
import { useServiceBooking } from "@/context/ServiceBookingContext";
import { ADDRESSES_STORAGE_KEY, BookingAddress } from "@/types/booking";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type AddressFormData = z.infer<typeof addressSchema>;

function loadAddresses(): BookingAddress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BookingAddress[];
  } catch {
    return [];
  }
}

function saveAddresses(addresses: BookingAddress[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
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
    pincode: user?.pincode ?? "-",
  };
}

export default function AddressSelector() {
  const { user } = useAuth();
  const { selectedAddress, setSelectedAddress, nextStep, prevStep } =
    useServiceBooking();
  const [savedAddresses, setSavedAddresses] = useState<BookingAddress[]>(() =>
    loadAddresses()
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addresses = useMemo(() => {
    if (savedAddresses.length > 0) return savedAddresses;
    if (user?.address && user.city && user.pincode) {
      return [createAddressFromUser(user)];
    }
    return [];
  }, [savedAddresses, user]);

  const persistAddresses = useCallback((updated: BookingAddress[]) => {
    setSavedAddresses(updated);
    saveAddresses(updated);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const openAddModal = () => {
    setEditingId(null);
    const defaultAddr = user ? createAddressFromUser(user) : null;
    reset({
      fullName: defaultAddr ? defaultAddr.fullName : "",
      phone: user?.mobile ?? "",
      address: "",
      city: user?.city ?? "",
      pincode: user?.pincode ?? "",
    });
    setModalOpen(true);
  };

  const openEditModal = (addr: BookingAddress) => {
    setEditingId(addr.id);
    reset({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      pincode: addr.pincode,
    });
    setModalOpen(true);
  };

  const onSubmit = (data: AddressFormData) => {
    let updated: BookingAddress[];

    if (editingId) {
      updated = addresses.map((a) =>
        a.id === editingId ? { ...a, ...data } : a
      );
    } else {
      const newAddress: BookingAddress = {
        id: createAddressId(),
        ...data,
      };
      updated = [...addresses, newAddress];
    }

    persistAddresses(updated);

    const saved = editingId
      ? updated.find((a) => a.id === editingId)
      : updated[updated.length - 1];
    if (saved) setSelectedAddress(saved);

    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    persistAddresses(updated);
    if (selectedAddress?.id === id) setSelectedAddress(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Select Address</h2>
          <p className="mt-1 text-sm text-gray-600">
            Choose or add a delivery address
          </p>
        </div>
        <Button size="sm" onClick={openAddModal}>
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-10 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
          <p className="font-medium text-gray-700">No addresses saved</p>
          <p className="mt-1 text-sm text-gray-500">Add an address to continue</p>
          <Button size="sm" className="mt-4" onClick={openAddModal}>
            Add Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const isSelected = selectedAddress?.id === addr.id;
            return (
              <div
                key={addr.id}
                className={`rounded-xl border p-4 transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/80"
                    : "border-gray-200 bg-white/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAddress(addr)}
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{addr.fullName}</p>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {addr.address}, {addr.city} - {addr.pincode}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-emerald-700"
                      aria-label="Edit address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {addr.id !== "profile-default" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
          <Input label="City" error={errors.city?.message} {...register("city")} />
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
