"use client";
import { useEffect, useState } from "react";
import { getFinanceSummary, getFinanceReport, getInvoices } from "../../lib/api";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[#0e1627] shadow-2xl border border-[#121a2c] ${className}`}>
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
      const [s, r, inv] = await Promise.all([
        getFinanceSummary(token),
        getFinanceReport(token),
        getInvoices(token),
      ]);
      setSummary(s);
      setReport(r);
      setInvoices(inv.slice(0, 5));
    } catch (e) {
      setError("خطا در دریافت اطلاعات داشبورد");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>در حال بارگذاری...</div>;

  const profit = Number(report.profit || 0);
  const sales = Number(report.total_sales || summary.total_sales || 0);
  const expenses = Number(report.total_expenses || 0);
  const healthPercent = sales ? Math.round(((sales - expenses) / sales) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center">
            admin
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">خلاصه وضعیت کارگاه</h1>
            <p className="text-xs text-gray-500">مرور سریع وضعیت مالی و عملیاتی</p>
          </div>
        </div>
        <button className="hidden md:flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg">
          بروزرسانی تحلیل
        </button>
      </div>

      {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600/50 via-purple-600/40 to-sky-600/30">
                <HealthWidget percent={healthPercent} />
              </div>
            </div>
            <div className="space-y-4">
              <button className="w-full h-24 rounded-2xl bg-[#121a2c] hover:bg-[#152034] transition shadow-xl text-right px-5 flex items-center justify-between">
                <span className="text-gray-200 font-bold">ثبت هزینه</span>
                <span className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center text-xl">-</span>
              </button>
              <a href="/invoices" className="w-full block h-24 rounded-2xl bg-amber-400/90 hover:bg-amber-400 transition shadow-xl text-right px-5 flex items-center justify-between text-black">
                <span className="font-extrabold">ثبت فاکتور</span>
                <span className="w-10 h-10 rounded-xl bg-white/20 text-black flex items-center justify-center text-xl">+</span>
              </a>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs text-gray-400">درآمد امروز (AFN)</div>
          <div className="text-3xl font-extrabold text-amber-300 mt-2">AFN {Number(summary.today_income || 0).toLocaleString("fa-AF")}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-gray-400">کل فاکتورها</div>
          <div className="text-3xl font-extrabold text-rose-300 mt-2">{Number(summary.invoice_count || 0).toLocaleString("fa-AF")}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs text-gray-400">فروش کل (AFN)</div>
          <div className="text-3xl font-extrabold text-emerald-300 mt-2">AFN {Number(summary.total_sales || 0).toLocaleString("fa-AF")}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <Stat label="سود خالص (AFN)" value={profit} color="text-amber-300" />
        </Card>
        <Card>
          <Stat label="هزینه‌ها (AFN)" value={expenses} color="text-rose-400" />
        </Card>
        <Card>
          <Stat label="فروش (AFN)" value={sales} color="text-emerald-400" />
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
              <div key={inv.id} className="bg-[#0b1220] border border-[#1d2a47] rounded-2xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    #
                  </div>
                  <div>
                    <p className="text-sm text-gray-200">{inv.customer_name}</p>
                    <p className="text-xs text-gray-500">{new Date(inv.created_at).toLocaleDateString("fa-AF")}</p>
                  </div>
                </div>
                <div className="text-amber-300 font-bold">AFN {Number(inv.total_amount || 0).toLocaleString("fa-AF")}</div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="text-gray-500 text-sm py-6 text-center">فاکتوری ثبت نشده است.</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">وضعیت روز</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-[#0b1220]">
              <p className="text-sm text-gray-400">درآمد امروز</p>
              <p className="text-xl font-extrabold text-amber-300">AFN {Number(summary.today_income || 0).toLocaleString("fa-AF")}</p>
            </Card>
            <Card className="p-4 bg-[#0b1220]">
              <p className="text-sm text-gray-400">تعداد فاکتور</p>
              <p className="text-xl font-extrabold text-emerald-400">{Number(summary.invoice_count || 0).toLocaleString("fa-AF")}</p>
            </Card>
            <Card className="p-4 bg-[#0b1220]">
              <p className="text-sm text-gray-400">فروش کل</p>
              <p className="text-xl font-extrabold text-indigo-300">AFN {Number(summary.total_sales || 0).toLocaleString("fa-AF")}</p>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
