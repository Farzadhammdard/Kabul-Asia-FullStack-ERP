"use client";
import { useEffect, useState } from "react";
import { getFinanceSummary, getFinanceReport, getInvoices, getExpenses } from "@/lib/api";
import { formatPersianDate } from "@/lib/date";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[#0e1627] shadow-2xl border border-[#121a2c] ${className}`}>
      {children}
    </div>
  );
}

function Stat({ label, value, color = "text-gray-200", prefix = "AFN" }) {
  return (
    <div className="p-4">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>
        {prefix} {Number(value || 0).toLocaleString("fa-AF")}
      </p>
    </div>
  );
}

function HealthWidget({ percent = 0 }) {
  const pct = Math.max(0, Math.min(999, Number(percent)));
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20" viewBox="0 0 36 36">
          <path className="text-[#1f2a44]" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32"></path>
          <path className="text-emerald-400" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" style={{ strokeDasharray: `${pct}, 100` }}></path>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-amber-300 font-bold">{pct}%</div>
      </div>
      <div>
        <p className="text-gray-300 font-semibold">وضعیت سلامت مالی ماه</p>
        <p className="text-xs text-amber-300 mt-1">برای بهبود سود خالص، کنترل هزینه‌ها پیشنهاد می‌شود.</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState({ today_income: 0, invoice_count: 0, total_sales: 0 });
  const [report, setReport] = useState({ total_sales: 0, total_expenses: 0, profit: 0 });
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
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
        setError("برای مشاهده داشبورد باید وارد شوید.");
        setLoading(false);
        return;
      }
      const [s, r, inv, exp] = await Promise.all([
        getFinanceSummary(token),
        getFinanceReport(token),
        getInvoices(token),
        getExpenses(token, {}),
      ]);
      setSummary(s);
      setReport(r);
      setInvoices(inv.slice(0, 5));
      setExpenses(exp.slice(0, 5));
    } catch (e) {
      setError("خطا در دریافت اطلاعات داشبورد");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#0e1627] border border-white/5 p-8 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded-full mb-4" />
          <div className="h-4 w-72 bg-white/10 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-64 rounded-3xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  const computedProfit = Number(report.profit || 0) || (Number(report.total_sales || 0) - Number(report.total_expenses || 0));
  const profit = Number(computedProfit || 0);
  const sales = Number(report.total_sales || summary.total_sales || 0);
  const expensesValue = Number(report.total_expenses || 0);
  const healthPercent = sales ? Math.round(((sales - expensesValue) / sales) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center">
            KA
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">داشبورد کارخانه نجاری مدرن</h1>
            <p className="text-xs text-gray-500">کنترل سریع وضعیت مالی، فاکتورها و مصارف</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/invoices" className="px-4 py-2 rounded-full bg-amber-400/90 hover:bg-amber-400 text-black font-bold">ثبت فاکتور</a>
          <a href="/finance?newExpense=1" className="px-4 py-2 rounded-full bg-rose-500/90 hover:bg-rose-500 text-white font-bold">ثبت هزینه</a>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#2b1b12]/70 via-[#1c2336]/60 to-[#0e1627]">
            <HealthWidget percent={healthPercent} />
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#0b1220] border border-white/5 p-4">
              <div className="text-xs text-gray-400">درآمد امروز</div>
              <div className="text-2xl font-extrabold text-amber-300 mt-2">AFN {Number(summary.today_income || 0).toLocaleString("fa-AF")}</div>
            </div>
            <div className="rounded-2xl bg-[#0b1220] border border-white/5 p-4">
              <div className="text-xs text-gray-400">تعداد فاکتور</div>
              <div className="text-2xl font-extrabold text-emerald-300 mt-2">{Number(summary.invoice_count || 0).toLocaleString("fa-AF")}</div>
            </div>
            <div className="rounded-2xl bg-[#0b1220] border border-white/5 p-4">
              <div className="text-xs text-gray-400">مجموع مصارف</div>
              <div className="text-2xl font-extrabold text-rose-300 mt-2">AFN {Number(expensesValue || 0).toLocaleString("fa-AF")}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Stat label="سود خالص (AFN)" value={profit} color="text-amber-300" />
          <div className="mt-4 rounded-2xl bg-[#0b1220] border border-white/5 p-4 text-xs text-gray-400">
            نسبت سلامت مالی براساس فروش و هزینه‌ها محاسبه شده است.
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">آخرین فاکتورها</h3>
            <a href="/invoices" className="text-xs text-gray-400 hover:text-gray-200">مشاهده همه</a>
          </div>
          <div className="space-y-3">
            {invoices.map((inv) => (
              <a
                key={inv.id}
                href={`/invoices?edit=${inv.id}`}
                className="bg-[#0b1220] border border-[#1d2a47] rounded-2xl px-4 py-3 flex items-center justify-between hover:bg-[#101a2e] transition"
                title="ویرایش فاکتور"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    #
                  </div>
                  <div>
                    <p className="text-sm text-gray-200">{inv.customer_name}</p>
                    <p className="text-xs text-gray-500">{formatPersianDate(inv.created_at)}</p>
                  </div>
                </div>
                <div className="text-amber-300 font-bold">AFN {Number(inv.total_amount || 0).toLocaleString("fa-AF")}</div>
              </a>
            ))}
            {invoices.length === 0 && (
              <div className="text-gray-500 text-sm py-6 text-center">فاکتوری ثبت نشده است.</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">مصارف اخیر کارگاه</h3>
            <a href="/finance" className="text-xs text-gray-400 hover:text-gray-200">مشاهده همه</a>
          </div>
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-[#0b1220] border border-[#1d2a47] rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">{exp.title}</p>
                  <p className="text-xs text-gray-500">{exp.category || "متفرقه"} • {formatPersianDate(exp.date)}</p>
                </div>
                <div className="text-rose-300 font-bold">AFN {Number(exp.amount || 0).toLocaleString("fa-AF")}</div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-gray-500 text-sm py-6 text-center">هزینه‌ای ثبت نشده است.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
