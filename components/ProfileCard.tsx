import { User } from "@/types/user";
import { MapPin, Phone, User as UserIcon } from "lucide-react";

interface ProfileCardProps {
  user?: (Partial<User> & { name?: string }) | null;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const rawFirstName = user?.firstName ?? "";
  const rawLastName = user?.lastName ?? "";
  const rawName = user?.name ?? "";

  let firstName = rawFirstName;
  let lastName = rawLastName;

  if (!firstName && !lastName && rawName) {
    const parts = rawName.trim().split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ") ?? "";
  }

  const firstInitial = (firstName ?? "").trim().charAt(0) ?? "";
  const lastInitial = (lastName ?? "").trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.trim().toUpperCase();

  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (rawName || "User");
  const mobile = user?.mobile || "-";

  return (
    <div className="overflow-hidden rounded-xl border border-white/40 bg-white/70 p-6 shadow-xl shadow-emerald-500/10 backdrop-blur-md">
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
        <div className="mb-4 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-400 text-2xl font-bold text-white shadow-lg shadow-emerald-500/30 sm:mb-0 sm:mr-6">
          {initials || <UserIcon className="h-8 w-8" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {displayName}
          </h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
            <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
              <Phone className="h-4 w-4 text-emerald-600" />
              {mobile}
            </span>
            {user?.city && (
              <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
                <MapPin className="h-4 w-4 text-emerald-600" />
                {user.city}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
