"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (requireAdmin && profile?.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 font-mono text-2xl animate-pulse">
          AUTHENTICATING...
        </div>
      </div>
    );
  }

  if (!user || (requireAdmin && profile?.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
