"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Button from "./Button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/#why-us", label: "Why Us" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/worker/dashboard", label: "Worker Portal" },
];

export default function Navbar() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const showAuth = mounted && !isLoading;

  const filteredNavLinks = navLinks.filter(
    (link) => !(isAuthenticated && link.href.includes("/worker"))
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-green-500 text-sm font-bold text-white shadow-md shadow-emerald-500/30">
            U
          </span>
          <span className="text-xl font-bold tracking-tight text-emerald-800">
            ustadji
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {filteredNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {!showAuth ? (
            <div className="h-9 w-36 animate-pulse rounded-xl bg-gray-200/80" />
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/worker/login">
                <Button variant="ghost" size="sm">
                  Worker Login
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-gray-600 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-emerald-100 bg-white/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {filteredNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-emerald-100" />
            {!showAuth ? null : isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/worker/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Worker Login
                  </Button>
                </Link>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
