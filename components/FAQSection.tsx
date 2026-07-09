"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What services are available?",
    answer:
      "We offer Mistri, Labour, Plumber, Electrician, Woodworker, Painter, Carpenter, and Cleaner services. Browse our services page to find the right professional for your needs.",
  },
  {
    question: "How can I book a worker?",
    answer:
      "Create an account, browse available services, and click Book Now. You can also submit a service request from your dashboard with details about your problem.",
  },
  {
    question: "Can I find nearby workers?",
    answer:
      "Yes! Register with your city and address, and we match you with trusted professionals available in your area.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Reach us via email at hd674552@gmail.com or call +91 7042292044. You can also use our contact form for service inquiries.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-gray-600">
            Everything you need to know about booking with ustadji
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-white/40 bg-white/70 shadow-sm backdrop-blur-md transition hover:shadow-md"
              >
                <button
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-emerald-600 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
