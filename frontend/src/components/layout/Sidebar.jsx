"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <aside className="w-64 bg-[#0b1220] border-r border-white/5 text-gray-300 flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <div>
          <div className="font-bold text-amber-400">کابل آسیا</div>
          <div className="text-[10px] text-gray-500">پنل مدیریت متمرکز</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center">
          KA
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
        <Link
          href="/dashboard"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/dashboard") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          داشبورد
        </Link>
        <Link
          href="/finance"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/finance") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          بخش مالی
        </Link>
        <Link
          href="/invoices"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/invoices") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          فاکتورها
        </Link>
        <Link
          href="/services"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/services") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          خدمات
        </Link>

        <div className="mt-6 text-gray-400 text-xs px-3">تنظیمات</div>
        <Link
          href="/settings/company"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/settings/company") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          تنظیمات شرکت
        </Link>
        <Link
          href="/settings/users"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/settings/users") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          کاربران
        </Link>
        <Link
          href="/settings/profile"
          className={`block px-3 py-2 rounded-lg transition ${
            isActive("/settings/profile") ? "bg-amber-400/20 text-amber-300" : "hover:bg-white/5"
          }`}
        >
          پروفایل من
        </Link>
      </nav>

      <div className="p-4 text-xs text-red-400 border-t border-white/5">
        خروج از سیستم
      </div>
    </aside>
  );
}
