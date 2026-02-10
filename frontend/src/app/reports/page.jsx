"use client";
import { useEffect, useMemo, useState } from "react";
import { getExpenses, getFinanceMonthly, getFinanceReport, getInvoices } from "@/lib/api";
import { formatPersianDate } from "@/lib/date";
import { useI18n } from "@/components/i18n/I18nProvider";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[var(--card-bg)] shadow-2xl border border-[var(--border-color)] p-6 ${className}`}>
      {children}
    </div>
  );
}

function formatDate(dateStr) {
  return formatPersianDate(dateStr);
}

export default function ReportsPage() {
  const { t } = useI18n();
  const [report, setReport] = useState({ total_sales: 0, total_expenses: 0, profit: 0, total_invoices: 0, top_products: [] });
  const [monthly, setMonthly] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({ start: "", end: "" });
  const [range, setRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  async function load(nextFilters) {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("برای مشاهده گزارش مالی باید وارد شوید.");
        setLoading(false);
        return;
      }
      const params = { start: nextFilters?.start ?? filters.start, end: nextFilters?.end ?? filters.end };
      const [r, m, e, inv] = await Promise.all([
        getFinanceReport(token, params),
        getFinanceMonthly(token, params),
        getExpenses(token, params),
        getInvoices(token),
      ]);
      setReport(r);
      setMonthly(m);
      setExpenses(e);
      setInvoices(inv);
    } catch (e) {
      setError("خطا در دریافت اطلاعات مالی");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!filters.start && !filters.end) {
      applyQuickFilter("week");
    }
  }, []);

  async function onDownloadPdf() {
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      const params = new URLSearchParams();
      if (filters.start) params.append("start", filters.start);
      if (filters.end) params.append("end", filters.end);
      const qs = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api"}/finance/report/pdf/${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("PDF failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "finance-report.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError("دانلود PDF ناموفق بود. نسخه چاپی باز شد؛ برای ذخیره PDF از گزینه Print استفاده کنید.");
      onPrintReport();
    }
  }

  function applyQuickFilter(nextRange) {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const startDate = new Date(now);
    if (nextRange === "day") startDate.setDate(now.getDate() - 1);
    if (nextRange === "week") startDate.setDate(now.getDate() - 7);
    if (nextRange === "month") startDate.setMonth(now.getMonth() - 1);
    const start = startDate.toISOString().slice(0, 10);
    const next = { start, end };
    setRange(nextRange);
    setFilters(next);
    load(next);
  }

  function filterByDate(list, dateKey) {
    if (!filters.start && !filters.end) return list;
    const start = filters.start ? new Date(filters.start) : null;
    const end = filters.end ? new Date(filters.end) : null;
    return list.filter((item) => {
      const dt = new Date(item[dateKey]);
      if (start && dt < start) return false;
      if (end && dt > new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1)) return false;
      return true;
    });
  }

  function onPrintReport() {
    const printableExpenses = filterByDate(expenses, "date");
    const printableInvoices = filterByDate(invoices, "created_at");
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;

    const rowsExpenses = printableExpenses
      .map(
        (e, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${e.title}</td>
          <td>${e.category || "-"}</td>
          <td>${formatDate(e.date)}</td>
          <td>${Number(e.amount || 0).toLocaleString("fa-AF")}</td>
        </tr>
      `
      )
      .join("");

    const rowsInvoices = printableInvoices
      .map(
        (inv, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${inv.customer_name || "-"}</td>
          <td>${formatDate(inv.created_at)}</td>
          <td>${Number(inv.total_amount || 0).toLocaleString("fa-AF")}</td>
        </tr>
      `
      )
      .join("");

    win.document.write(`
      <!doctype html>
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>گزارش مالی</title>
          <style>
            body { font-family: Tahoma, Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { font-size: 20px; margin: 0 0 12px; }
            h2 { font-size: 14px; margin: 20px 0 8px; }
            .meta { display: flex; justify-content: space-between; font-size: 12px; color: #334155; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #cbd5f5; padding: 8px; text-align: center; }
            th { background: #f8fafc; }
            .summary { margin-top: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
            .box { border: 1px solid #cbd5f5; padding: 8px; border-radius: 8px; background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>گزارش مالی کارخانه نجاری</h1>
          <div class="meta">
            <div>تاریخ شروع: ${formatPersianDate(filters.start) || "-"}</div>
            <div>تاریخ پایان: ${formatPersianDate(filters.end) || "-"}</div>
          </div>
          <div class="summary">
            <div class="box">فروشات: افغانی ${Number(report.total_sales || 0).toLocaleString("fa-AF")}</div>
            <div class="box">مصارف: افغانی ${Number(report.total_expenses || 0).toLocaleString("fa-AF")}</div>
            <div class="box">سود خالص: افغانی ${Number(report.profit || 0).toLocaleString("fa-AF")}</div>
          </div>

          <h2>بل‌ها</h2>
          <table>
            <thead><tr><th>#</th><th>مشتری</th><th>تاریخ</th><th>مبلغ</th></tr></thead>
            <tbody>${rowsInvoices || "<tr><td colspan='4'>بلی ثبت نشده است.</td></tr>"}</tbody>
          </table>

          <h2>مصارف</h2>
          <table>
            <thead><tr><th>#</th><th>شرح</th><th>دسته</th><th>تاریخ</th><th>مبلغ</th></tr></thead>
            <tbody>${rowsExpenses || "<tr><td colspan='5'>مصرفی ثبت نشده است.</td></tr>"}</tbody>
          </table>

          <script>window.focus(); window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  }

  const maxMonthly = useMemo(() => {
    const values = monthly.flatMap((m) => [Number(m.income || 0), Number(m.expense || 0)]);
    return Math.max(1, ...values);
  }, [monthly]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-3xl bg-[var(--card-bg)]/50 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 rounded-3xl bg-[var(--card-bg)]/50 animate-pulse" />
          <div className="h-24 rounded-3xl bg-[var(--card-bg)]/50 animate-pulse" />
          <div className="h-24 rounded-3xl bg-[var(--card-bg)]/50 animate-pulse" />
        </div>
        <div className="h-56 rounded-3xl bg-[var(--card-bg)]/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t("reportsTitle")}</h2>
          <p className="text-xs text-gray-400 mt-1">{t("financeTitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPrintReport}
            className="bg-slate-200/90 hover:bg-white text-black font-bold px-4 py-2 rounded-full"
          >
            {t("printReport")}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("financeFilter")}</label>
            <select
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={range}
              onChange={(e) => applyQuickFilter(e.target.value)}
            >
              <option value="day">{t("oneDay")}</option>
              <option value="week">{t("oneWeek")}</option>
              <option value="month">{t("oneMonth")}</option>
            </select>
          </div>
          <div className="text-xs text-[var(--muted)]">{t("fromDate")}: {formatPersianDate(filters.start)}</div>
          <div className="text-xs text-[var(--muted)]">{t("toDate")}: {formatPersianDate(filters.end)}</div>
          <button
            onClick={onDownloadPdf}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-full"
          >
            {t("downloadPdf")}
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-400">درآمد کل</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">?? {Number(report.total_sales || 0).toLocaleString("fa-AF")}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">هزینه‌ها</p>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">?? {Number(report.total_expenses || 0).toLocaleString("fa-AF")}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">سود خالص</p>
          <p className="text-2xl font-extrabold text-amber-300 mt-2">?? {Number(report.profit || 0).toLocaleString("fa-AF")}</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">گزارش ماهانه</h3>
          <span className="text-xs text-gray-400">۱۲ ماه اخیر</span>
        </div>
        <div className="grid grid-cols-12 gap-2 items-end h-44">
          {monthly.map((m) => {
            const incomeHeight = Math.round((Number(m.income || 0) / maxMonthly) * 100);
            const expenseHeight = Math.round((Number(m.expense || 0) / maxMonthly) * 100);
            return (
              <div key={m.label} className="flex flex-col items-center gap-2">
                <div className="w-4 bg-emerald-500/60 rounded-t" style={{ height: `${incomeHeight}%` }} title={`درآمد: ${m.income}`}></div>
                <div className="w-4 bg-rose-500/60 rounded-t" style={{ height: `${expenseHeight}%` }} title={`هزینه: ${m.expense}`}></div>
                <div className="text-[10px] text-gray-400">{m.label}</div>
              </div>
            );
          })}
          {monthly.length === 0 && (
            <div className="col-span-12 text-sm text-gray-500">داده‌ای برای نمایش وجود ندارد.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
