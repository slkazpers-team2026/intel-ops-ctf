import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "INTEL-OPS CTF PLATFORM",
  description: "Secure Intelligence Capture The Flag Environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="scanline"></div>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
