export interface WorkerCreatePayload {
  name: string;
  email: string;
  mobile: string;
  gender: string;
  date_of_birth: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  category_id: number;
  experience_years: number;
  skills: string;
  about: string;
  aadhaar_number: string;
  profile_image: string;
  aadhaar_front: string;
  aadhaar_back: string;
  latitude?: number;
  longitude?: number;
  is_available?: boolean;
}

export interface WorkerKycPayload {
  worker_id: number;
  aadhaar_number: string;
  pan_number?: string | null;
  account_holder_name?: string | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  aadhaar_front?: string | null;
  aadhaar_back?: string | null;
  pan_card_image?: string | null;
  passbook_image?: string | null;
  selfie_image?: string | null;
}

/** KYC identity + bank fields collected in the onboarding form (before worker_id exists). */
export interface WorkerKycDetails {
  aadhaar_number: string;
  pan_number: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
}

export interface WorkerProfile extends WorkerCreatePayload {
  worker_id?: number;
  id?: number;
  status?: string;
  rejection_reason?: string;
  pan_number?: string;
  account_holder_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  pan_card_image?: string;
  passbook_image?: string;
  selfie_image?: string;
}

export interface WorkerAccount {
  user_id: number;
  mobile: string;
  worker_id?: number;
}

export interface WorkerLoginPayload {
  mobile: string;
  password: string;
}

export interface WorkerRegisterPayload {
  mobile: string;
  password: string;
}

export interface WorkerLoginResponse {
  message?: string;
  user_id: number;
}

export interface WorkerRegisterResponse {
  message?: string;
  user_id?: number;
  id?: number;
}

export interface WorkerUserProfileResponse {
  user_id?: number;
  id?: number;
  mobile?: string;
  worker_id?: number;
  name?: string;
  [key: string]: unknown;
}

export const WORKER_CATEGORIES: { id: number; label: string }[] = [
  { id: 1, label: "Plumber" },
  { id: 2, label: "Electrician" },
  { id: 3, label: "Carpenter" },
  { id: 4, label: "Painter" },
  { id: 5, label: "AC Technician" },
  { id: 6, label: "Mason" },
  { id: 7, label: "Welder" },
  { id: 8, label: "General Helper" },
];

export function getWorkerId(profile: WorkerProfile | null | undefined): number | null {
  if (!profile) return null;
  const id = profile.worker_id ?? profile.id;
  return typeof id === "number" && !Number.isNaN(id) ? id : null;
}

export function getCategoryLabel(categoryId: number): string {
  return WORKER_CATEGORIES.find((c) => c.id === categoryId)?.label ?? `Category #${categoryId}`;
}
