"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api";
import { decodeJwt } from "@/lib/jwt";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const cached = typeof window !== "undefined" ? localStorage.getItem("is_staff") : null;

    if (cached === "true") {
      setIsAdmin(true);
    }

    if (token) {
      const payload = decodeJwt(token);
      if (payload?.is_staff) {
        setIsAdmin(true);
      }
    } else {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then((u) => setIsAdmin(Boolean(u?.is_staff)))
      .catch(() => setIsAdmin(cached === "true"))
      .finally(() => setLoading(false));
  }, []);

  return { isAdmin, loading };
}
