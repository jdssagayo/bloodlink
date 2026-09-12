"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requiredRole?: string | string[]) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (!token || !role || !email) {
      router.push("/login");
      return;
    }

    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(role)) {
        router.push("/login");
        return;
      }
    }

    setUser({ email, role });
    setReady(true);
  }, [router, requiredRole]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.push("/login");
  }

  return { ready, user, logout };
}