"use client";
import { useEffect, useState } from "react";
import { getFinanceSummary, getFinanceReport, getInvoices, getExpenses, getEmployees, getCompanySettings } from "@/lib/api";
import { formatPersianDate } from "@/lib/date";
import { useI18n } from "@/components/i18n/I18nProvider";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[var(--card-bg)] shadow-2xl border border-[var(--border-color)] ${className}`}>
      {children}
    </div>
  );
}

function Stat({ label, value, color = "text-gray-200", prefix = "افغانی" }) {
  return (
    <div className="p-4">
      <p className="text-sm text-[var(--muted)] mb-2">{label}</p>
      <p className={`text-2xl font-extrabold ${color}`}>
        {prefix} {Number(value || 0).toLocaleString("fa-AF")}
      </p>
    </div>
  );
}

function HealthWidget({ percent = 0, title, hint }) {
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
        <p className="text-gray-300 font-semibold">{title}</p>
        <p className="text-xs text-amber-300 mt-1">{hint}</p>
      </div>
    </div>
  );
}

function MiniCard({ title, value, accent = "border-amber-400/60", icon }) {
  return (
    <div className={`rounded-2xl border ${accent} bg-[var(--panel-bg)]/80 p-4 shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--muted)]">{title}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [summary, setSummary] = useState({ today_income: 0, invoice_count: 0, total_sales: 0 });
  const [report, setReport] = useState({ total_sales: 0, total_expenses: 0, profit: 0 });
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [company, setCompany] = useState({ company_name: "", address: "", phone: "" });
  const [query, setQuery] = useState("");
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
        setError(t("loginRequired"));
        setLoading(false);
        return;
      }
      const [s, r, inv, exp, emp, cs] = await Promise.all([
        getFinanceSummary(token),
        getFinanceReport(token),
        getInvoices(token),
        getExpenses(token, {}),
        getEmployees(token),
        getCompanySettings(token),
      ]);
      setSummary(s);
      setReport(r);
      setInvoices(inv.slice(0, 5));
      setExpenses(exp.slice(0, 5));
      setEmployees(emp);
      setCompany({
        company_name: cs?.company_name || "",
        address: cs?.address || "",
        phone: cs?.phone || "",
      });
    } catch (e) {
      setError(t("errorDashboardLoad") || "خطا در دریافت اطلاعات داشبورد");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = localStorage.getItem("dashboard_query");
    if (q) {
      setQuery(q);
      localStorage.removeItem("dashboard_query");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onSearch(e) {
      const q = e?.detail?.query ?? "";
      setQuery(q);
    }
    window.addEventListener("dashboard:search", onSearch);
    return () => window.removeEventListener("dashboard:search", onSearch);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-8 animate-pulse">
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

  const totalSalaries = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);
  const computedProfit = Number(report.profit || 0) || (Number(report.total_sales || 0) - Number(report.total_expenses || 0));
  const profit = Number(computedProfit || 0) - Number(totalSalaries || 0);
  const salesGross = Number(report.total_sales || summary.total_sales || 0);
  const salesNet = Math.max(0, salesGross - Number(totalSalaries || 0));
  const expensesValue = Number(report.total_expenses || 0) + Number(totalSalaries || 0);
  const healthPercent = salesGross ? Math.round(((salesGross - expensesValue) / salesGross) * 100) : 0;

  const filteredInvoices = invoices.filter((inv) =>
    String(inv.customer_name || "").toLowerCase().includes(String(query || "").trim().toLowerCase())
  );
  const filteredExpenses = expenses.filter((exp) =>
    String(exp.title || "").toLowerCase().includes(String(query || "").trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center">
            KA
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{company.company_name || t("dashboardTitle")}</h1>
            <p className="text-xs text-[var(--muted)]">
              {company.address || t("dashboardSubtitle")}
              {company.phone ? ` • ${company.phone}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/invoices" className="px-4 py-2 rounded-full bg-amber-400/90 hover:bg-amber-400 text-black font-bold">{t("quickInvoice")}</a>
          <a href="/finance?newExpense=1" className="px-4 py-2 rounded-full bg-rose-500/90 hover:bg-rose-500 text-white font-bold">{t("quickExpense")}</a>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 lg:col-span-2">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1c1b16]/70 via-[#1f2433]/60 to-[var(--card-bg)]">
            <HealthWidget percent={healthPercent} title={t("healthStatus")} hint={t("healthHint")} />
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <MiniCard
              title={t("todayIncome")}
              value={`افغانی ${Number(summary.today_income || 0).toLocaleString("fa-AF")}`}
              accent="border-amber-400/60"
              icon="₳"
            />
            <MiniCard
              title={t("invoiceCount")}
              value={Number(summary.invoice_count || 0).toLocaleString("fa-AF")}
              accent="border-emerald-400/60"
              icon="✦"
            />
            <MiniCard
              title={t("expensesTotal")}
              value={`افغانی ${Number(expensesValue || 0).toLocaleString("fa-AF")}`}
              accent="border-rose-400/60"
              icon="▣"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <Stat label={t("netProfitLabel")} value={profit} color="text-amber-300" />
          <div className="rounded-2xl bg-[var(--panel-bg)] border border-[var(--border-color)] p-4 text-xs text-[var(--muted)]">
            {t("healthHint")}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[var(--panel-bg)] border border-[var(--border-color)] p-3 text-center text-xs">
              {t("sales")}
              <div className="text-emerald-300 font-bold mt-1">افغانی {Number(salesNet || 0).toLocaleString("fa-AF")}</div>
            </div>
            <div className="rounded-xl bg-[var(--panel-bg)] border border-[var(--border-color)] p-3 text-center text-xs">
              {t("expense")}
              <div className="text-rose-300 font-bold mt-1">افغانی {Number(expensesValue || 0).toLocaleString("fa-AF")}</div>
            </div>
            <div className="rounded-xl bg-[var(--panel-bg)] border border-[var(--border-color)] p-3 text-center text-xs">
              {t("profit")}
              <div className="text-amber-300 font-bold mt-1">افغانی {Number(profit || 0).toLocaleString("fa-AF")}</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{t("totalSalaries")}</h3>
        </div>
        <div className="text-2xl font-extrabold text-rose-300">افغانی {Number(totalSalaries || 0).toLocaleString("fa-AF")}</div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/invoices" className="rounded-3xl border border-indigo-400/50 bg-[var(--panel-bg)] p-5 shadow-lg hover:bg-black/5 transition">
          <div className="text-sm text-[var(--muted)]">{t("quickSearch")}</div>
          <div className="text-xl font-extrabold mt-2">{t("quickInvoice")}</div>
          <div className="text-xs text-[var(--muted)] mt-2">{t("reportsTitle")}</div>
        </a>
        <a href="/finance?newExpense=1" className="rounded-3xl border border-rose-400/50 bg-[var(--panel-bg)] p-5 shadow-lg hover:bg-black/5 transition">
          <div className="text-sm text-[var(--muted)]">{t("quickSearch")}</div>
          <div className="text-xl font-extrabold mt-2">{t("quickExpense")}</div>
          <div className="text-xs text-[var(--muted)] mt-2">{t("financeTitle")}</div>
        </a>
        <a href="/finance" className="rounded-3xl border border-emerald-400/50 bg-[var(--panel-bg)] p-5 shadow-lg hover:bg-black/5 transition">
          <div className="text-sm text-[var(--muted)]">{t("quickSearch")}</div>
          <div className="text-xl font-extrabold mt-2">{t("quickReport")}</div>
          <div className="text-xs text-[var(--muted)] mt-2">{t("downloadPdf")}</div>
        </a>
        <a href="http://127.0.0.1:8000/admin/" className="rounded-3xl border border-amber-400/50 bg-[var(--panel-bg)] p-5 shadow-lg hover:bg-black/5 transition">
          <div className="text-sm text-[var(--muted)]">{t("quickSearch")}</div>
          <div className="text-xl font-extrabold mt-2">{t("djangoAdmin")}</div>
          <div className="text-xs text-[var(--muted)] mt-2">{t("adminLogin")}</div>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{t("lastInvoices")}</h3>
          <a href="/invoices" className="text-xs text-[var(--muted)] hover:text-[var(--app-text)]">{t("viewAll")}</a>
          </div>
          <div className="space-y-3">
            {filteredInvoices.map((inv) => (
              <a
                key={inv.id}
                href={`/invoices?edit=${inv.id}`}
                className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl px-4 py-3 flex items-center justify-between hover:bg-black/5 transition"
                title={t("invoiceEdit")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    #
                  </div>
                  <div>
                    <p className="text-sm text-gray-200">{inv.customer_name}</p>
                    <p className="text-xs text-[var(--muted)]">{formatPersianDate(inv.created_at)}</p>
                  </div>
                </div>
                <div className="text-amber-300 font-bold">افغانی {Number(inv.total_amount || 0).toLocaleString("fa-AF")}</div>
              </a>
            ))}
            {filteredInvoices.length === 0 && (
              <div className="text-[var(--muted)] text-sm py-6 text-center">{t("noInvoices")}</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{t("recentExpenses")}</h3>
          <a href="/finance" className="text-xs text-[var(--muted)] hover:text-[var(--app-text)]">{t("viewAll")}</a>
          </div>
          <div className="space-y-3">
            {filteredExpenses.map((exp) => (
              <div key={exp.id} className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">{exp.title}</p>
                  <p className="text-xs text-[var(--muted)]">{exp.category || t("misc")} • {formatPersianDate(exp.date)}</p>
                </div>
                <div className="text-rose-300 font-bold">افغانی {Number(exp.amount || 0).toLocaleString("fa-AF")}</div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="text-[var(--muted)] text-sm py-6 text-center">{t("noExpenses")}</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
