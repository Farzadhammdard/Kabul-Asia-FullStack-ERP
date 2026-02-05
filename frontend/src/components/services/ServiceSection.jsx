"use client";
import { useEffect, useMemo, useState } from "react";
import { getInvoices, getServices } from "@/lib/api";
import { formatPersianDate } from "@/lib/date";

function PencilIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function BadgeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export default function ServiceSection({ title, tag }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = getToken();
        if (!token) {
          setError("برای مشاهده خدمات ابتدا وارد شوید.");
          setLoading(false);
          return;
        }
        const [inv, svc] = await Promise.all([getInvoices(token), getServices(token)]);
        setInvoices(inv);
        setServices(svc);
      } catch (e) {
        setError("خطا در دریافت اطلاعات خدمات");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const serviceMap = useMemo(() => new Map(services.map((s) => [String(s.id), s])), [services]);
  const normalizedTag = String(tag || title || "").trim().toLowerCase();
  const items = useMemo(() => {
    const list = [];
    invoices.forEach((inv) => {
      (inv.items || []).forEach((item) => {
        const serviceName = String(item.service_name || serviceMap.get(String(item.service))?.name || "").trim().toLowerCase();
        if (serviceName === normalizedTag) {
          list.push({
            invoiceId: inv.id,
            customer: inv.customer_name,
            total: Number(item.quantity || 0) * Number(item.price || 0),
            qty: item.quantity,
            unit: item.price,
            date: inv.created_at,
          });
        }
      });
    });
    return list;
  }, [invoices, serviceMap, normalizedTag]);

  const unitLabel = normalizedTag === "cutting" ? "تخته" : "متر";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
            {tag?.[0] || "S"}
          </div>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <a href="/services" className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-200">
            بازگشت
          </a>
          <a
            href={`/invoices?service=${encodeURIComponent(tag || title || "")}`}
            className="bg-amber-400/90 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-full"
          >
            + فاکتور جدید
          </a>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-[#0e1627] border border-white/5 p-6 shadow-2xl h-48 animate-pulse" />
          <div className="rounded-3xl bg-[#0e1627] border border-white/5 p-6 shadow-2xl h-48 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((card, idx) => (
          <div key={`${card.invoiceId}-${idx}`} className="rounded-3xl bg-[#0e1627] border border-[#121a2c] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full">ID: #{card.invoiceId}</div>
              <a href={`/invoices?edit=${card.invoiceId}`} className="w-9 h-9 rounded-full bg-white/5 text-amber-300 flex items-center justify-center" title="ویرایش فاکتور">
                <PencilIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="text-lg font-bold text-gray-100">{card.customer}</div>
            <div className="text-xs text-gray-500 mt-1">سرویس: {tag}</div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-gray-400">
              <div>{unitLabel}: {card.qty}</div>
              <div>فی واحد: {card.unit}</div>
              <div className="text-rose-300">تخفیف: 0</div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="text-amber-300 font-bold">AFN {card.total.toLocaleString("fa-AF")}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BadgeIcon className="w-4 h-4" />
                {formatPersianDate(card.date)}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !error && (
          <div className="col-span-full text-center text-gray-500">برای این سرویس هنوز آیتمی ثبت نشده است.</div>
        )}
      </div>
      )}
    </div>
  );
}
