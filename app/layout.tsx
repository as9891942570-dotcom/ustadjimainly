import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { WorkerAuthProvider } from "@/context/WorkerAuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ustadji | Find Trusted Professionals Near You",
  description:
    "Book skilled workers for your home services quickly and easily. Plumbers, electricians, carpenters, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <WorkerAuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" richColors closeButton />
          </WorkerAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
