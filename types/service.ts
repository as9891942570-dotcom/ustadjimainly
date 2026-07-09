import { LucideIcon } from "lucide-react";
import {
  Hammer,
  HardHat,
  Wrench,
  Zap,
  Trees,
  Paintbrush,
  Ruler,
  Sparkles,
  Briefcase,
} from "lucide-react";
import type { ServicePreference } from "./booking";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  workerType: string;
  preferences: ServicePreference[];
}

const ICON_KEYWORDS: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["mistri", "handyman", "helper"], icon: Hammer },
  { keywords: ["labour", "labor", "loading", "civil"], icon: HardHat },
  { keywords: ["plumb"], icon: Wrench },
  { keywords: ["electric", "wiring"], icon: Zap },
  { keywords: ["wood", "carpenter", "carpentry"], icon: Trees },
  { keywords: ["paint"], icon: Paintbrush },
  { keywords: ["carpenter", "ruler"], icon: Ruler },
  { keywords: ["clean"], icon: Sparkles },
];

export function getServiceIcon(name: string | null | undefined): LucideIcon {
  const normalized = (name ?? "").toLowerCase();
  for (const entry of ICON_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.icon;
    }
  }
  return Briefcase;
}
