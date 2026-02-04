"use client";
import { useEffect, useState } from "react";
import { getCompanySettings, updateCompanySettings } from "@/lib/api";
import Link from "next/link";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function CompanySettingsPage() {
  const [form, setForm] = useState({ company_name: "", address: "", phone: "", currency: "AFN", theme: "dark" });
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
        setError("برای دسترسی به تنظیمات ابتدا وارد شوید.");
        return;
      }
      const data = await getCompanySettings(token);
      setForm({
        company_name: data.company_name || "",
        address: data.address || "",
        phone: data.phone || "",
        currency: data.currency || "AFN",
        theme: data.theme || "dark",
      });
    } catch (e) {
      setError("خطا در دریافت تنظیمات");
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
        setError("ابتدا وارد شوید");
        return;
      }
      const payload = { ...form };
      await updateCompanySettings(payload, token);
      setSuccess("تنظیمات با موفقیت ذخیره شد");
    } catch (e) {
      setError("ذخیره تنظیمات ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>در حال بارگذاری...</div>;

  const token = getToken();
  if (!token) {
    return (
      <div>
        <Card>
          <p className="mb-4">برای مشاهده این صفحه باید وارد شوید.</p>
          <Link className="text-amber-300" href="/login">رفتن به صفحه ورود</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold mb-2">تنظیمات شرکت</h1>

      <Card>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {error && <div className="md:col-span-2 text-red-400 bg-red-500/10 rounded p-2 text-sm">{error}</div>}
          {success && <div className="md:col-span-2 text-emerald-400 bg-emerald-500/10 rounded p-2 text-sm">{success}</div>}

          <div>
            <label className="block text-sm mb-1 text-gray-400">نام شرکت</label>
            <input
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              placeholder="کابل آسیا دکوریشن"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">تلفن</label>
            <input
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="07xx xxx xxx"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-gray-400">آدرس</label>
            <input
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="کابل، ..."
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">واحد پول</label>
            <select
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="AFN">AFN</option>
              <option value="USD">USD</option>
              <option value="IRR">IRR</option>
              <option value="PKR">PKR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">تم</label>
            <select
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}
            >
              <option value="dark">تیره</option>
              <option value="light">روشن</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black px-5 py-2 rounded-full font-bold"
            >
              {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
