"use client";
import { useEffect, useState } from "react";
import { getCompanySettings, updateCompanySettings } from "@/lib/api";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useAdmin } from "@/lib/useAdmin";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { showToast } from "@/lib/toast";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[var(--card-bg)] shadow-2xl border border-[var(--border-color)] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function CompanySettingsPage() {
  const { t } = useI18n();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [form, setForm] = useState({ company_name: "", address: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        return;
      }
      const data = await getCompanySettings(token);
      setForm({
        company_name: data.company_name || "",
        address: data.address || "",
        phone: data.phone || "",
      });
    } catch (e) {
      setError(t("errorSettingsLoad") || "خطا در دریافت تنظیمات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError(t("loginRequired"));
        return;
      }
      const payload = { ...form };
      const saved = await updateCompanySettings(payload, token);
      if (typeof window !== "undefined") {
        localStorage.setItem("company_name", saved?.company_name || form.company_name || "");
        window.dispatchEvent(new CustomEvent("company:updated", { detail: { company_name: saved?.company_name || form.company_name || "" } }));
      }
      const msg = t("settingsSaved") || "تنظیمات با موفقیت ذخیره شد";
      setSuccess(msg);
      showToast(msg);
    } catch (e) {
      setError(t("settingsSaveError") || "ذخیره تنظیمات ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  if (loading || adminLoading) return <LoadingSkeleton className="mx-auto" />;

  const token = getToken();
  if (!token) {
    return (
      <div>
        <Card>
          <p className="mb-4">{t("loginRequired")}</p>
          <Link className="text-amber-300" href="/login">{t("backToLogin")}</Link>
        </Card>
      </div>
    );
  }
  if (!isAdmin) return <div className="text-[var(--muted)]">{t("accessDeniedAdmin")}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold mb-2">{t("companySettings")}</h1>

      <Card>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {error && <div className="md:col-span-2 text-red-400 bg-red-500/10 rounded p-2 text-sm">{error}</div>}
          {success && <div className="md:col-span-2 text-emerald-400 bg-emerald-500/10 rounded p-2 text-sm">{success}</div>}

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("name")}</label>
            <input
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="کابل آسیا دکوریشن"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("phone")}</label>
            <input
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="07xx xxx xxx"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("address")}</label>
            <input
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="کابل، ..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black px-5 py-2 rounded-full font-bold flex items-center justify-center gap-2"
            >
              {saving && <span className="spinner" />}
              {saving ? t("save") : t("saveChanges")}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
