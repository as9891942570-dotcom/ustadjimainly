import Link from "next/link";
import Button from "@/components/Button";
import FAQSection from "@/components/FAQSection";
import {
  ArrowRight,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react";

const helpTopics = [
  {
    title: "Booking a Service",
    description: "Learn how to select a service, choose preferences, and schedule your appointment.",
  },
  {
    title: "Payments",
    description: "We currently support cash-on-delivery. Pay the professional after the job is done.",
  },
  {
    title: "Account & Profile",
    description: "Update your personal details and saved addresses from your profile page.",
  },
  {
    title: "Service Requests",
    description: "Track your submitted requests and booking history from the dashboard.",
  },
];

export default function SupportPage() {
  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
            <HelpCircle className="h-4 w-4" />
            Customer Support
          </span>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            How can we help you?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Get in touch with our team or browse common help topics below.
          </p>
        </div>

        <div className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                <Phone className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Contact Us</h2>
            </div>
            <p className="mb-5 text-sm text-gray-600">
              Reach out directly for booking help, account issues, or urgent support.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+917042292044"
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white/80 px-4 py-3 transition hover:border-emerald-300"
              >
                <Phone className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">+91 7042292044</p>
                </div>
              </a>
              <a
                href="mailto:hd674552@gmail.com"
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white/80 px-4 py-3 transition hover:border-emerald-300"
              >
                <Mail className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">hd674552@gmail.com</p>
                </div>
              </a>
            </div>
            <Link href="/contact" className="mt-5 inline-block">
              <Button size="sm">
                Submit a Request
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Help Section</h2>
            </div>
            <p className="mb-5 text-sm text-gray-600">
              Quick answers to common questions about using ustadji.
            </p>
            <div className="space-y-3">
              {helpTopics.map((topic) => (
                <div
                  key={topic.title}
                  className="rounded-xl border border-gray-100 bg-white/80 px-4 py-3"
                >
                  <p className="font-semibold text-gray-900">{topic.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <FAQSection />
      </div>
    </div>
  );
}
