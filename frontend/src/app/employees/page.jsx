"use client";
import { useEffect, useState } from "react";
import { createEmployee, deleteEmployee, getCurrentUser, getEmployees, refreshAccessToken } from "@/lib/api";
import { useI18n } from "@/components/i18n/I18nProvider";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { showToast } from "@/lib/toast";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[var(--card-bg)] shadow-2xl border border-[var(--border-color)] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function EmployeesPage() {
  const { t } = useI18n();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", role: "", salary: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      let token = getToken();
      if (!token && typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const data = await refreshAccessToken(refreshToken);
            token = data?.access || null;
            if (token) localStorage.setItem("accessToken", token);
          } catch {}
        }
      }
      if (!token) {
        setError(t("loginRequired"));
        setLoading(false);
        return;
      }
      const [data, user] = await Promise.all([getEmployees(token), getCurrentUser(token)]);
      setEmployees(data);
      setIsAdmin(Boolean(user?.is_staff));
    } catch (e) {
      setError("خطا در دریافت شاگردان");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError(t("loginRequired"));
        return;
      }
      await createEmployee(
        {
          name: form.name,
          role: form.role,
          salary: Number(form.salary || 0),
        },
        token
      );
      setForm({ name: "", role: "", salary: "" });
      showToast("شاگرد با موفقیت ثبت شد.");
      load();
    } catch (e) {
      setError("ایجاد شاگرد ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    try {
      const token = getToken();
      if (!token) return;
      await deleteEmployee(id, token);
      load();
    } catch (e) {
      setError("حذف شاگرد ناموفق بود");
    }
  }

  async function onCreateSamples() {
    setSaving(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError(t("loginRequired"));
        return;
      }
      const samples = [
        { name: "احمد", role: "نجار", salary: 12000 },
        { name: "جمال", role: "برش‌کار", salary: 9000 },
        { name: "سعید", role: "رنگ‌کار", salary: 10000 },
      ];
      await Promise.all(samples.map((s) => createEmployee(s, token)));
      showToast("شاگردان نمونه اضافه شد.");
      load();
    } catch (e) {
      setError("ایجاد شاگردان نمونه ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSkeleton className="mx-auto" />;

  if (!isAdmin) {
    return <div className="text-[var(--muted)]">{t("loginRequired")}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold">{t("employeesTitle")}</h2>

      {error && (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("name")}</label>
            <input
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("role")}</label>
            <input
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("salary")}</label>
            <input
              type="number"
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-full flex items-center justify-center gap-2"
          >
            {saving && <span className="spinner" />}
            {saving ? t("save") : t("addEmployee")}
          </button>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--panel-bg)]">
                <th className="p-2">#</th>
                <th className="p-2">{t("name")}</th>
                <th className="p-2">{t("role")}</th>
                <th className="p-2">{t("salary")}</th>
                <th className="p-2">{t("settings")}</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-[var(--border-color)]">
                  <td className="p-2">{e.id}</td>
                  <td className="p-2">{e.name}</td>
                  <td className="p-2">{e.role}</td>
                  <td className="p-2 text-amber-300">?? {Number(e.salary || 0).toLocaleString("fa-AF")}</td>
                  <td className="p-2">
                    <button onClick={() => onDelete(e.id)} className="text-rose-300">🗑 {t("delete")}</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--muted)] py-6">
                    <div className="space-y-2">
                      <div>{t("noEmployees")}</div>
                      <button
                        type="button"
                        onClick={onCreateSamples}
                        className="inline-flex items-center gap-2 bg-[var(--accent)] text-black px-3 py-1 rounded-full text-xs font-bold"
                        disabled={saving}
                      >
                        {t("addSampleEmployees")}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
