"use client";
import { useEffect, useMemo, useState } from "react";
import { createExpense, deleteExpense, getExpenses, getFinanceMonthly, getFinanceReport } from "@/lib/api";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function FinancePage() {
  const [report, setReport] = useState({ total_sales: 0, total_expenses: 0, profit: 0, total_invoices: 0, top_products: [] });
  const [monthly, setMonthly] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "" });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filters, setFilters] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("برای مشاهده گزارش مالی باید وارد شوید.");
        setLoading(false);
        return;
      }
      const params = { start: filters.start, end: filters.end };
      const [r, m, e] = await Promise.all([
        getFinanceReport(token, params),
        getFinanceMonthly(token, params),
        getExpenses(token, params),
      ]);
      setReport(r);
      setMonthly(m);
      setExpenses(e);
    } catch (e) {
      setError("خطا در دریافت اطلاعات مالی");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreateExpense(e) {
    e.preventDefault();
    setError("");
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
      load();
    } catch (e) {
      setError("ثبت هزینه ناموفق بود");
    }
  }

  async function onDeleteExpense(id) {
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      await deleteExpense(id, token);
      load();
    } catch (e) {
      setError("حذف هزینه ناموفق بود");
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

  const maxMonthly = useMemo(() => {
    const values = monthly.flatMap((m) => [Number(m.income || 0), Number(m.expense || 0)]);
    return Math.max(1, ...values);
  }, [monthly]);

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">دفتر ثبت هزینه‌ها</h2>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="bg-rose-500/80 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-full"
        >
          ثبت هزینه جدید
        </button>
      </div>

      {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1 text-gray-400">از تاریخ</label>
            <input
              type="date"
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={filters.start}
              onChange={(e) => setFilters({ ...filters, start: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">تا تاریخ</label>
            <input
              type="date"
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={filters.end}
              onChange={(e) => setFilters({ ...filters, end: e.target.value })}
            />
          </div>
          <button
            onClick={load}
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
        <Card>
          <h3 className="font-semibold mb-4">راهنما</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>برای ثبت هزینه جدید روی دکمه «ثبت هزینه جدید» کلیک کنید.</p>
            <p>هزینه‌ها در جدول سمت چپ نمایش داده می‌شوند.</p>
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
                    <p className="text-xs text-gray-500">{exp.category || "متفرقه"} • {new Date(exp.date).toLocaleDateString("fa-AF")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-300">AFN {Number(exp.amount || 0).toLocaleString("fa-AF")}</span>
                  <button onClick={() => onDeleteExpense(exp.id)} className="w-8 h-8 rounded-full bg-white/5 text-red-300">×</button>
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
              >
                ثبت نهایی
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
