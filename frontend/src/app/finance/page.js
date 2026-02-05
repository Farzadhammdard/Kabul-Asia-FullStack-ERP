"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createExpense, deleteExpense, getExpenses, getFinanceMonthly, getFinanceReport, getInvoices } from "@/lib/api";
import { formatPersianDate, parseJalaliToGregorian } from "@/lib/date";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

function formatDate(dateStr) {
  return formatPersianDate(dateStr);
}

export default function FinancePage() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState({ total_sales: 0, total_expenses: 0, profit: 0, total_invoices: 0, top_products: [] });
  const [monthly, setMonthly] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "" });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filters, setFilters] = useState({ start: "", end: "" });
  const [jalaliFilters, setJalaliFilters] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    if (searchParams?.get("newExpense") === "1") {
      setShowExpenseModal(true);
    }
  }, [searchParams]);

  async function onCreateExpense(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      await createExpense(
        {
          title: form.title,
          category: form.category,
          amount: Number(form.amount || 0),
        },
        token
      );
      setForm({ title: "", amount: "", category: "" });
      setShowExpenseModal(false);
      setSuccess("هزینه با موفقیت ثبت شد.");
      load();
    } catch (e) {
      setError("ثبت هزینه ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteExpense(id) {
    const confirmDelete = typeof window !== "undefined" ? window.confirm("آیا از حذف این هزینه مطمئن هستید؟") : true;
    if (!confirmDelete) return;
    setBusy(true);
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      await deleteExpense(id, token);
      setSuccess("هزینه حذف شد.");
      load();
    } catch (e) {
      setError("حذف هزینه ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

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
      setError("دانلود PDF ناموفق بود");
    }
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
            <div class="box">فروشات: AFN ${Number(report.total_sales || 0).toLocaleString("fa-AF")}</div>
            <div class="box">مصارف: AFN ${Number(report.total_expenses || 0).toLocaleString("fa-AF")}</div>
            <div class="box">سود خالص: AFN ${Number(report.profit || 0).toLocaleString("fa-AF")}</div>
          </div>

          <h2>فاکتورها</h2>
          <table>
            <thead><tr><th>#</th><th>مشتری</th><th>تاریخ</th><th>مبلغ</th></tr></thead>
            <tbody>${rowsInvoices || "<tr><td colspan='4'>فاکتوری ثبت نشده است.</td></tr>"}</tbody>
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
        <div className="h-16 rounded-3xl bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-24 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-24 rounded-3xl bg-white/5 animate-pulse" />
        </div>
        <div className="h-56 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">دفتر ثبت هزینه‌ها و گزارش مالی</h2>
          <p className="text-xs text-gray-400 mt-1">تحلیل سریع فروشات، مصارف و فاکتورها</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-rose-500/80 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-full"
          >
            ثبت هزینه جدید
          </button>
          <button
            onClick={onPrintReport}
            className="bg-slate-200/90 hover:bg-white text-black font-bold px-4 py-2 rounded-full"
          >
            چاپ گزارش
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {success}
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1 text-gray-400">از تاریخ (هجری شمسی)</label>
            <input
              type="text"
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              placeholder="1404/11/04"
              value={jalaliFilters.start}
              onChange={(e) => setJalaliFilters({ ...jalaliFilters, start: e.target.value })}
            />
            {filters.start && (
              <div className="mt-1 text-[11px] text-gray-500">میلادی: {filters.start}</div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">تا تاریخ (هجری شمسی)</label>
            <input
              type="text"
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              placeholder="1404/11/04"
              value={jalaliFilters.end}
              onChange={(e) => setJalaliFilters({ ...jalaliFilters, end: e.target.value })}
            />
            {filters.end && (
              <div className="mt-1 text-[11px] text-gray-500">میلادی: {filters.end}</div>
            )}
          </div>
          <button
            onClick={applyJalaliFilters}
            className="bg-sky-500/80 hover:bg-sky-500 text-black font-bold px-4 py-2 rounded-full"
          >
            اعمال فیلتر
          </button>
          <button
            onClick={onDownloadPdf}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-full"
          >
            خروجی PDF
          </button>
          <div className="text-xs text-gray-400">فیلتر روی فروشات، مصارف و فاکتورها اعمال می‌شود.</div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-400">درآمد کل</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">AFN {Number(report.total_sales || 0).toLocaleString("fa-AF")}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">هزینه‌ها</p>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">AFN {Number(report.total_expenses || 0).toLocaleString("fa-AF")}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">سود خالص</p>
          <p className="text-2xl font-extrabold text-amber-300 mt-2">AFN {Number(report.profit || 0).toLocaleString("fa-AF")}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-amber-400/20">
          <h3 className="font-semibold mb-4 text-amber-300">راهنمای عملیات مالی</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>برای ثبت هزینه جدید، روی «ثبت هزینه جدید» کلیک کنید و دسته‌بندی را مشخص نمایید.</p>
            <p>با فیلتر تاریخ می‌توانید گزارش کامل فروشات، مصارف و فاکتورها را دریافت کنید.</p>
            <p>برای چاپ گزارش، از دکمه «چاپ گزارش» استفاده کنید.</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">لیست هزینه‌های جاری کارگاه</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between bg-[#0b1220] border border-[#1d2a47] rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                    -
                  </div>
                  <div>
                    <p className="text-sm text-gray-200">{exp.title}</p>
                    <p className="text-xs text-gray-500">{exp.category || "متفرقه"} • {formatDate(exp.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-300">AFN {Number(exp.amount || 0).toLocaleString("fa-AF")}</span>
                  <button onClick={() => onDeleteExpense(exp.id)} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-red-300">×</button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <div className="text-gray-500 text-sm">هزینه‌ای ثبت نشده است.</div>}
          </div>
        </Card>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-[#0f172a] border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-amber-300">ثبت هزینه جدید کارگاه</h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-gray-400"
              >
                ×
              </button>
            </div>
            <form onSubmit={onCreateExpense} className="space-y-3">
              <input
                className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                placeholder="شرح هزینه"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                placeholder="دسته‌بندی"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                placeholder="مبلغ (AFN)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <button
                className="w-full bg-rose-500/90 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-full"
                type="submit"
                disabled={busy}
              >
                {busy ? "در حال ثبت..." : "ثبت نهایی"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
  function applyJalaliFilters() {
    const gStart = jalaliFilters.start ? parseJalaliToGregorian(jalaliFilters.start) : "";
    const gEnd = jalaliFilters.end ? parseJalaliToGregorian(jalaliFilters.end) : "";
    if (jalaliFilters.start && !gStart) {
      setError("فرمت تاریخ شروع درست نیست. نمونه: 1404/11/04");
      return;
    }
    if (jalaliFilters.end && !gEnd) {
      setError("فرمت تاریخ پایان درست نیست. نمونه: 1404/11/04");
      return;
    }
    const next = { start: gStart || "", end: gEnd || "" };
    setFilters(next);
    load(next);
  }
