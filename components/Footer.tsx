import Link from "next/link";
import { Globe, Mail, Phone, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-bold">
                U
              </span>
              <span className="text-xl font-bold">ustadji</span>
            </div>
            <p className="text-sm leading-relaxed text-emerald-100">
              Your trusted platform for booking skilled home service professionals
              near you.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm text-emerald-100">
              <li>
                <a
                  href="mailto:hd674552@gmail.com"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  hd674552@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+917042292044"
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  +91 7042292044
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Support</h3>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li>
                <Link href="/support" className="transition hover:text-white">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="mb-6 space-y-2 text-sm text-emerald-100">
              <li>
                <Link href="#" className="transition hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:text-white">
                  Privacy
                </Link>
              </li>
            </ul>
            <h3 className="mb-4 font-semibold">Follow Us</h3>
            <div className="flex gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
                  aria-label="Social link"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-sm text-emerald-100">
          © 2026 USTAD JI PRIVATE LIMITED. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
