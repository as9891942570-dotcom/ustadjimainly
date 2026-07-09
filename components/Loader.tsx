interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-emerald-600 border-t-transparent ${sizeMap[size]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white/60 p-6">
      <div className="mb-4 h-12 w-12 rounded-xl bg-gray-200" />
      <div className="mb-2 h-5 w-2/3 rounded-lg bg-gray-200" />
      <div className="mb-4 h-4 w-full rounded-lg bg-gray-200" />
      <div className="h-9 w-full rounded-xl bg-gray-200" />
    </div>
  );
}
