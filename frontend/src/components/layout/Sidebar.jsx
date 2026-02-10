"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAdmin } from "@/lib/useAdmin";

export default function Sidebar({ companyName = "" }) {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);
  const { t } = useI18n();
  const { isAdmin, loading: adminLoading } = useAdmin();

  return (
    <aside className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] text-[var(--app-text)] flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        <div>
          <div className="font-bold text-amber-400">{companyName || "کابل آسیا"}</div>
          <div className="text-[10px] text-[var(--muted)]">{t("panelTitle")}</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
          {companyName ? companyName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "KA"}
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        <Link
          href="/dashboard"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/dashboard") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          {t("dashboard")}
        </Link>
        <Link
          href="/finance"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/finance") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          {t("finance")}
        </Link>
        <Link
          href="/invoices"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/invoices") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          {t("invoices")}
        </Link>
        <Link
          href="/services"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/services") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          {t("services")}
        </Link>

        {!adminLoading && isAdmin && (
          <>
            <div className="mt-6 text-[var(--muted)] text-xs px-3">{t("settings")}</div>
            <Link
              href="/settings/company"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/settings/company") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
              }`}
            >
              {t("company")}
            </Link>
            <Link
              href="/settings/users"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/settings/users") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
              }`}
            >
              {t("users")}
            </Link>
            <Link
              href="/employees"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/employees") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
              }`}
            >
              {t("employees")}
            </Link>
            <Link
              href="/settings/profile"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/settings/profile") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
              }`}
            >
              {t("profile")}
            </Link>
            <Link
              href="/reports"
              className={`block px-3 py-2 rounded-lg transition ${
                isActive("/reports") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
              }`}
            >
              {t("reports")}
            </Link>
          </>
        )}
      </nav>

      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/login";
          }
        }}
        className="p-4 text-xs text-red-400 border-t border-[var(--border-color)] text-right hover:bg-black/5"
      >
        {t("logout")}
      </button>
    </aside>
  );
}
