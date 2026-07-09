import axios, { AxiosError } from "axios";
import { ServicePreference } from "@/types/booking";
import { Service, getServiceIcon } from "@/types/service";

const SERVICE_API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/worker-api";

export const serviceApiClient = axios.create({
  baseURL: SERVICE_API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
});

interface ApiSkill {
  id: number;
  skill_name: string;
}

interface ApiServiceRecord {
  id?: number | string;
  name?: string;
  title?: string;
  service_name?: string;
  description?: string;
  worker_type?: string;
  preferences?: Array<{
    id?: number | string;
    label?: string;
    name?: string;
    description?: string;
  }>;
}

function capitalize(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return "";
  return value
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      const first = word.charAt(0)?.toUpperCase() ?? "";
      const rest = word.slice(1)?.toLowerCase() ?? "";
      return first + rest;
    })
    .join(" ");
}

function normalizePreference(
  pref: NonNullable<ApiServiceRecord["preferences"]>[number],
  index: number
): ServicePreference {
  const label = pref.label || pref.name || `Option ${index + 1}`;
  return {
    id: String(pref.id ?? `pref-${index}`),
    label,
    description: pref.description || `${label} service option`,
  };
}

function mapApiService(record: ApiServiceRecord, index: number): Service {
  const title =
    record.title ||
    record.name ||
    record.service_name ||
    record.worker_type ||
    `Service ${index + 1}`;

  const preferences =
    record.preferences?.map(normalizePreference) ??
    [
      {
        id: String(record.id ?? `default-${index}`),
        label: title,
        description: `Standard ${title} service`,
      },
    ];

  return {
    id: String(record.id ?? title.toLowerCase().replace(/\s+/g, "-")),
    title: capitalize(title),
    description:
      record.description ||
      `Professional ${capitalize(title)} services for your home.`,
    icon: getServiceIcon(title),
    workerType: record.worker_type || capitalize(title),
    preferences,
  };
}

function getServiceGroupKey(skillName: string | null | undefined): string {
  const normalized = (skillName ?? "").trim().toLowerCase();
  const words = normalized.split(/\s+/);
  return words[words.length - 1] || normalized;
}

function mapSkillsToServices(skills: ApiSkill[] | null | undefined): Service[] {
  const groups = new Map<string, ApiSkill[]>();
  const safeSkills = skills ?? [];

  for (const skill of safeSkills) {
    if (!skill || !skill.skill_name) continue;
    const key = getServiceGroupKey(skill.skill_name);
    const existing = groups.get(key) ?? [];
    existing.push(skill);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([key, groupSkills]) => {
    const title = capitalize(key);
    const preferences: ServicePreference[] = groupSkills.map((skill) => ({
      id: String(skill.id),
      label: capitalize(skill.skill_name),
      description: `${capitalize(skill.skill_name)} service option`,
    }));

    return {
      id: key,
      title,
      description: `Professional ${title} services for your home.`,
      icon: getServiceIcon(title),
      workerType: title,
      preferences,
    };
  });
}

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "value" in data) {
    const value = (data as { value?: unknown }).value;
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

export function getServiceApiErrorMessage(
  error: unknown,
  fallback = "Unable to load services"
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { detail?: string | { msg?: string }[]; message?: string }
      | undefined;

    if (status === 401) return "Session expired. Please log in again.";
    if (status === 403) return "You do not have permission to view services.";
    if (status === 500) return "Server error. Please try again later.";

    if (data?.message) return data.message;

    if (Array.isArray(data?.detail)) {
      return data.detail.map((d) => d.msg).filter(Boolean).join(", ") || fallback;
    }

    if (typeof data?.detail === "string") return data.detail;

    if (error.code === "ECONNABORTED") {
      return "Request timed out. The server may be waking up — please try again.";
    }

    if (error.message === "Network Error") {
      return "Unable to reach the server. Please check your connection and try again.";
    }
  }

  return fallback;
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const { data } = await serviceApiClient.get<unknown>("/services");
    const records = unwrapList<ApiServiceRecord>(data);

    if (records.length > 0) {
      return records.map(mapApiService);
    }
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status && status !== 404) {
      throw error;
    }
  }

  const { data } = await serviceApiClient.get<unknown>("/skills");
  const skills = unwrapList<ApiSkill>(data);

  if (skills.length === 0) {
    return [];
  }

  return mapSkillsToServices(skills);
}

export async function fetchServiceById(serviceId: string): Promise<Service | null> {
  const services = await fetchServices();
  return services.find((service) => service.id === serviceId) ?? null;
}

export function getPreferencesForService(service: Service | null): ServicePreference[] {
  return service?.preferences ?? [];
}
