"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createExpense, deleteExpense, getExpenses, getFinanceReport, getInvoices, getServices, createInvoice } from "@/lib/api";
import { formatPersianDate } from "@/lib/date";
import { useI18n } from "@/components/i18n/I18nProvider";
import { showToast } from "@/lib/toast";

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

export default function FinancePage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [report, setReport] = useState({ total_sales: 0, total_expenses: 0, profit: 0, total_invoices: 0, top_products: [] });
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "", category: "" });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [filters, setFilters] = useState({ start: "", end: "" });
  const [range, setRange] = useState("week");
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
        setError(t("loginRequired"));
        setLoading(false);
        return;
      }
      const params = { start: nextFilters?.start ?? filters.start, end: nextFilters?.end ?? filters.end };
      const [r, e, inv, svc] = await Promise.all([
        getFinanceReport(token, params),
        getExpenses(token, params),
        getInvoices(token),
        getServices(token),
      ]);
      setReport(r);
      setExpenses(e);
      setInvoices(inv);
      setServices(svc);
    } catch (e) {
      setError(t("errorFinanceLoad") || "خطا در دریافت اطلاعات مالی");
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
        setError(t("loginRequired"));
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
      const msg = t("expenseSaved") || "هزینه با موفقیت ثبت شد.";
      setSuccess(msg);
      showToast(msg);
      load();
    } catch (e) {
      setError(t("expenseSaveError") || "ثبت هزینه ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteExpense(id) {
    const confirmDelete = typeof window !== "undefined" ? window.confirm(t("confirmDeleteExpense") || "آیا از حذف این هزینه مطمئن هستید؟") : true;
    if (!confirmDelete) return;
    setBusy(true);
    try {
      const token = getToken();
      if (!token) {
        setError(t("loginRequired"));
        return;
      }
      await deleteExpense(id, token);
      setSuccess(t("expenseDeleted") || "هزینه حذف شد.");
      load();
    } catch (e) {
      setError(t("expenseDeleteError") || "حذف هزینه ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function onDownloadPdf() {
    try {
      const token = getToken();
      if (!token) {
        setError(t("loginRequired"));
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
      setError(t("pdfDownloadFailed") || "دانلود PDF ناموفق بود. نسخه چاپی باز شد؛ برای ذخیره PDF از گزینه Print استفاده کنید.");
      onPrintReport();
    }
  }

  function onBackupData() {
    if (typeof window === "undefined") return;
    const payload = {
      version: 1,
      exported_at: new Date().toISOString(),
      invoices,
      expenses,
    };
    localStorage.setItem("backup_invoices", JSON.stringify(invoices));
    localStorage.setItem("backup_expenses", JSON.stringify(expenses));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-invoices-expenses.json";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function onImportData(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError(t("loginRequired"));
        return;
      }
      const text = await file.text();
      const data = JSON.parse(text);
      const importExpenses = Array.isArray(data?.expenses) ? data.expenses : [];
      const importInvoices = Array.isArray(data?.invoices) ? data.invoices : [];

      const normalize = (val) => String(val || "").trim().toLowerCase();
      const expenseKey = (exp) =>
        [
          normalize(exp.title),
          normalize(exp.category),
          Number(exp.amount || 0),
          normalize(exp.date),
        ].join("|");
      const invoiceItemKey = (it) =>
        [
          normalize(it.service_name || it.service),
          Number(it.quantity || 0),
          Number(it.price || 0),
        ].join("|");
      const invoiceKey = (inv) =>
        [
          normalize(inv.customer_name),
          Number(inv.total_amount || 0),
          normalize(inv.created_at),
          (inv.items || []).map(invoiceItemKey).join(","),
        ].join("|");

      const existingExpenseKeys = new Set(expenses.map(expenseKey));
      const existingInvoiceKeys = new Set(invoices.map(invoiceKey));
      const duplicateExpenses = importExpenses.filter((e) => existingExpenseKeys.has(expenseKey(e)));
      const duplicateInvoices = importInvoices.filter((i) => existingInvoiceKeys.has(invoiceKey(i)));

      let expensesToImport = importExpenses;
      let invoicesToImport = importInvoices;
      if (duplicateExpenses.length || duplicateInvoices.length) {
        const message =
          (t("importDuplicates") || "دیتاهای تکراری یافت شد.") +
          `\n` +
          (t("duplicateExpenses") || "مصارف تکراری") +
          `: ${duplicateExpenses.length}\n` +
          (t("duplicateInvoices") || "بل‌های تکراری") +
          `: ${duplicateInvoices.length}\n\n` +
          (t("importAllConfirm") || "آیا می‌خواهید همه را ایمپورت کنم؟") +
          `\n` +
          (t("importSkipDuplicates") || "اگر خیر بزنید، داده‌های تکراری وارد نمی‌شوند.");
        const ok = window.confirm(message);
        if (!ok) {
          const dupExpenseKeys = new Set(duplicateExpenses.map(expenseKey));
          const dupInvoiceKeys = new Set(duplicateInvoices.map(invoiceKey));
          expensesToImport = importExpenses.filter((e) => !dupExpenseKeys.has(expenseKey(e)));
          invoicesToImport = importInvoices.filter((i) => !dupInvoiceKeys.has(invoiceKey(i)));
        }
      }

      for (const exp of expensesToImport) {
        if (!exp?.title || !exp?.amount) continue;
        await createExpense(
          {
            title: exp.title,
            category: exp.category || "",
            amount: Number(exp.amount || 0),
          },
          token
        );
      }

      const serviceById = new Map(services.map((s) => [String(s.id), s]));
      const serviceByName = new Map(services.map((s) => [String(s.name || "").trim().toLowerCase(), s]));
      for (const inv of invoicesToImport) {
        const items = (inv.items || []).map((item) => {
          const id = String(item.service || "");
          const byId = serviceById.get(id);
          const byName = serviceByName.get(String(item.service_name || "").trim().toLowerCase());
          const svc = byId || byName;
          if (!svc) return null;
          return {
            service: Number(svc.id),
            quantity: Number(item.quantity || 0),
            price: Number(item.price || 0),
          };
        }).filter(Boolean);
        if (!items.length) continue;
        await createInvoice(
          { customer_name: inv.customer_name || "-", items },
          token
        );
      }

      if (!expensesToImport.length && !invoicesToImport.length) {
        setSuccess(t("importNone"));
      } else {
        setSuccess(t("importSuccess"));
      }
      load();
    } catch (e) {
      setError(t("importFailed"));
    } finally {
      setBusy(false);
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

    const reportTitle = t("reportTitle") || "گزارش مالی";
    const reportSubtitle = t("reportSubtitle") || "گزارش مالی کارخانه نجاری";
    const startLabel = t("startDateLabel") || "تاریخ شروع";
    const endLabel = t("endDateLabel") || "تاریخ پایان";
    const invoicesLabel = t("invoicesLabel") || "بل‌ها";
    const expensesLabel = t("expensesLabel") || "مصارف";
    const customerLabel = t("customerLabel") || "مشتری";
    const dateLabel = t("dateLabel") || "تاریخ";
    const amountLabel = t("amountLabel") || "مبلغ";
    const descLabel = t("descLabel") || "شرح";
    const categoryLabel = t("categoryLabel") || "دسته";
    const noInvoicesPrint = t("noInvoicesPrint") || "بلی ثبت نشده است.";
    const noExpensesPrint = t("noExpensesPrint") || "مصرفی ثبت نشده است.";
    const salesLabel = t("sales") || "فروشات";
    const expenseLabel = t("expense") || "مصارف";
    const netProfitLabel = t("netProfit") || "سود خالص";

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
          <title>${reportTitle}</title>
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
          <h1>${reportSubtitle}</h1>
          <div class="meta">
            <div>${startLabel}: ${formatPersianDate(filters.start) || "-"}</div>
            <div>${endLabel}: ${formatPersianDate(filters.end) || "-"}</div>
          </div>
          <div class="summary">
            <div class="box">${salesLabel}: افغانی ${Number(report.total_sales || 0).toLocaleString("fa-AF")}</div>
            <div class="box">${expenseLabel}: افغانی ${Number(report.total_expenses || 0).toLocaleString("fa-AF")}</div>
            <div class="box">${netProfitLabel}: افغانی ${Number(report.profit || 0).toLocaleString("fa-AF")}</div>
          </div>

          <h2>${invoicesLabel}</h2>
          <table>
            <thead><tr><th>#</th><th>${customerLabel}</th><th>${dateLabel}</th><th>${amountLabel}</th></tr></thead>
            <tbody>${rowsInvoices || `<tr><td colspan='4'>${noInvoicesPrint}</td></tr>`}</tbody>
          </table>

          <h2>${expensesLabel}</h2>
          <table>
            <thead><tr><th>#</th><th>${descLabel}</th><th>${categoryLabel}</th><th>${dateLabel}</th><th>${amountLabel}</th></tr></thead>
            <tbody>${rowsExpenses || `<tr><td colspan='5'>${noExpensesPrint}</td></tr>`}</tbody>
          </table>

          <script>window.focus(); window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  }

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
          <h2 className="text-xl font-bold">{t("financeTitle")}</h2>
          <p className="text-xs text-gray-400 mt-1">{t("reportsTitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="bg-rose-500/80 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-full"
          >
            {t("newExpense")}
          </button>
          <button
            onClick={onBackupData}
            className="bg-[var(--panel-bg)] hover:bg-black/5 text-[var(--app-text)] font-bold px-4 py-2 rounded-full border border-[var(--border-color)]"
          >
            {t("backup")}
          </button>
          <label className="bg-[var(--panel-bg)] hover:bg-black/5 text-[var(--app-text)] font-bold px-4 py-2 rounded-full border border-[var(--border-color)] cursor-pointer">
            {t("import")}
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => onImportData(e.target.files?.[0])}
              disabled={busy}
            />
          </label>
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
      {success && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {success}
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
          <p className="text-sm text-gray-400">{t("totalIncome")}</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">?? {Number(report.total_sales || 0).toLocaleString("fa-AF")}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">{t("totalExpense")}</p>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">?? {Number(report.total_expenses || 0).toLocaleString("fa-AF")}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">{t("netProfit") || t("profit")}</p>
          <p className="text-2xl font-extrabold text-amber-300 mt-2">?? {Number(report.profit || 0).toLocaleString("fa-AF")}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-amber-400/20">
          <h3 className="font-semibold mb-4 text-amber-300">{t("financeGuideTitle")}</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>{t("financeGuide1")}</p>
            <p>{t("financeGuide2")}</p>
            <p>{t("financeGuide3")}</p>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">{t("expensesListTitle")}</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
                    -
                  </div>
                  <div>
                    <p className="text-sm">{exp.title}</p>
                    <p className="text-xs text-[var(--muted)]">{exp.category || t("misc")} • {formatDate(exp.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-rose-300">?? {Number(exp.amount || 0).toLocaleString("fa-AF")}</span>
                  <button onClick={() => onDeleteExpense(exp.id)} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-red-300">×</button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <div className="text-[var(--muted)] text-sm">{t("noExpenses")}</div>}
          </div>
        </Card>
      </div>

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-[#0f172a] border border-white/10 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-amber-300">{t("newExpenseTitle")}</h3>
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
                placeholder={t("expenseDescPlaceholder")}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                placeholder={t("expenseCategoryPlaceholder")}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
                placeholder={t("expenseAmountPlaceholder")}
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <button
                className="w-full bg-rose-500/90 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-full flex items-center justify-center gap-2"
                type="submit"
                disabled={busy}
              >
                {busy && <span className="spinner" />}
                {busy ? t("saving") : t("submitFinal")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
