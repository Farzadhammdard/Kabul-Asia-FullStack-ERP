"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { getCurrentUser, getCompanySettings } from "@/lib/api";
import Toast from "@/components/common/Toast";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/forgot-password");
  const [company, setCompany] = useState({ company_name: "" });
  const [toast, setToast] = useState({ show: false, message: "" });
  const toastTimer = useRef(null);
  const [authReady, setAuthReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token && !isAuthPage) {
      router.replace("/login");
      setAuthReady(true);
      return;
    }
    setAuthReady(true);
    if (!token || isAuthPage) return;
    getCurrentUser(token)
      .then((u) => {
        localStorage.setItem("is_staff", u?.is_staff ? "true" : "false");
      })
      .catch(() => {
        localStorage.setItem("is_staff", "false");
      });
    getCompanySettings(token)
      .then((cs) => {
        setCompany({ company_name: cs?.company_name || "" });
        localStorage.setItem("company_name", cs?.company_name || "");
      })
      .catch(() => null);
  }, [isAuthPage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onCompanyUpdate(e) {
      const name = e?.detail?.company_name || localStorage.getItem("company_name") || "";
      setCompany({ company_name: name });
    }
    window.addEventListener("company:updated", onCompanyUpdate);
    return () => window.removeEventListener("company:updated", onCompanyUpdate);
  }, []);

  function showToast(message) {
    if (!message) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ show: true, message });
    toastTimer.current = setTimeout(() => setToast({ show: false, message: "" }), 2800);
  }

  useEffect(() => {
    if (typeof window === "undefined" || isAuthPage) return;
    const pending = localStorage.getItem("toast_pending");
    if (!pending) return;
    try {
      const data = JSON.parse(pending);
      showToast(data?.message);
    } catch {
      showToast(pending);
    }
    localStorage.removeItem("toast_pending");
  }, [isAuthPage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onToast(e) {
      showToast(e?.detail?.message);
    }
    window.addEventListener("toast:show", onToast);
    return () => window.removeEventListener("toast:show", onToast);
  }, []);

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>;
  }
  if (!mounted || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>Ø¯Ø± Ø­Ø§Ù„ Ø¨Ø§Ø±Ú¯Ø°Ø§Ø±ÛŒ...</div>
    );
  }

  return (
    <I18nProvider>
      <div className="flex h-screen">
        {toast.show && (
          <div className="fixed bottom-4 right-4 z-50">
            <Toast
              message={toast.message}
              className="toast-success"
              onClose={() => setToast({ show: false, message: "" })}
            />
          </div>
        )}
        <Sidebar companyName={company.company_name} />
        <div className="flex flex-col flex-1">
          <Topbar companyName={company.company_name} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </I18nProvider>
  );
}
