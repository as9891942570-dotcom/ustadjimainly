import Link from "next/link";
import Button from "@/components/Button";
import FeaturedServices from "@/components/FeaturedServices";
import FAQSection from "@/components/FAQSection";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Star,
  Users,
} from "lucide-react";

const whyUs = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description: "Every worker is background-checked and skill-verified.",
  },
  {
    icon: Clock,
    title: "Quick Booking",
    description: "Book a service in minutes with our simple platform.",
  },
  {
    icon: MapPin,
    title: "Local Experts",
    description: "Find trusted professionals right in your neighborhood.",
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "Satisfaction guaranteed on every service request.",
  },
];

const steps = [
  { step: "01", title: "Choose a Service", desc: "Browse our wide range of home services." },
  { step: "02", title: "Book Online", desc: "Submit your request with details about the job." },
  { step: "03", title: "Get It Done", desc: "A skilled professional arrives and completes the work." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-green-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              #1 Home Service Platform
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find Trusted{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                Professionals
              </span>{" "}
              Near You
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600">
              Book skilled workers for your home services quickly and easily
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/services">
                <Button size="lg">
                  Book Service
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="secondary" size="lg">
                  Explore Services
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                500+ Professionals
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                10,000+ Happy Customers
              </span>
            </div>
          </div>

          {/* Illustration / Floating cards */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto h-[420px] w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-400 opacity-90 shadow-2xl shadow-emerald-500/30" />
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-2xl bg-white/10 p-8 text-white backdrop-blur-sm">
                <p className="text-center text-lg font-bold">Your Home, Our Expertise</p>
                <p className="mt-2 text-center text-sm text-emerald-50">
                  Book trusted professionals in minutes
                </p>
              </div>

              {/* Floating cards */}
              <div className="absolute -left-8 top-12 animate-bounce rounded-xl border border-white/40 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md [animation-duration:3s]">
                <p className="text-xs font-medium text-gray-500">Booking confirmed</p>
                <p className="text-sm font-bold text-emerald-700">Plumber — Today 2PM</p>
              </div>
              <div className="absolute -right-6 bottom-16 animate-bounce rounded-xl border border-white/40 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-md [animation-duration:4s]">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-gray-800">4.9 Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Popular Services</h2>
            <p className="mt-2 text-gray-600">Professional help for every home need</p>
          </div>
          <FeaturedServices />
        </div>
      </section>

      {/* Why Us */}
      <section id="why-us" className="bg-white/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose ustadji?</h2>
            <p className="mt-2 text-gray-600">The smarter way to book home services</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/40 bg-white/70 p-6 text-center shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mx-auto mb-4 inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-2 text-gray-600">Three simple steps to get help at home</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-8 text-center shadow-sm"
              >
                <span className="mb-4 inline-block text-4xl font-black text-emerald-200">
                  {item.step}
                </span>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />

      {/* CTA */}
      <section className="mx-4 mb-16 sm:mx-6 lg:mx-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-12 text-center text-white shadow-xl shadow-emerald-500/25 sm:py-16">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-lg text-emerald-100">
            Join thousands of homeowners who trust ustadji for their home service needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button variant="secondary" size="lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/services">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Browse Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
