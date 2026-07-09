import { Service } from "@/types/service";
import Button from "./Button";
import Link from "next/link";

interface ServiceCardProps {
  service: Service;
  onBook?: (service: Service) => void;
  showBookButton?: boolean;
}

export default function ServiceCard({
  service,
  onBook,
  showBookButton = true,
}: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/40 bg-white/60 p-6 shadow-lg shadow-emerald-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/15">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400/20 to-green-300/10 transition-transform duration-300 group-hover:scale-110" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 p-3 text-white shadow-lg shadow-emerald-500/30">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{service.title}</h3>
        <p className="mb-5 text-sm leading-relaxed text-gray-600">
          {service.description}
        </p>
        {showBookButton && (
          onBook ? (
            <Button size="sm" onClick={() => onBook(service)} className="w-full">
              Book Now
            </Button>
          ) : (
            <Link href="/services">
              <Button size="sm" className="w-full">
                Book Now
              </Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
