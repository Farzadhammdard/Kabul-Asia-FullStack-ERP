"use client";
import { useEffect, useState } from "react";
import { createService, deleteService, getServices, updateService } from "@/lib/api";
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

export default function ServicesPage() {
  const { t } = useI18n();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  async function load() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError("برای مدیریت خدمات ابتدا وارد شوید.");
        setLoading(false);
        return;
      }
      const data = await getServices(token);
      setServices(data);
    } catch (e) {
      setError("خطا در دریافت خدمات");
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
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      if (!form.name.trim()) {
        setError("نام خدمت الزامی است");
        return;
      }
      await createService(
        {
          name: form.name,
          price: Number(form.price || 0),
        },
        token
      );
      setForm({ name: "", price: "" });
      setSuccess("خدمت با موفقیت ثبت شد.");
      showToast("خدمت با موفقیت ثبت شد.");
      load();
    } catch (e) {
      setError("ایجاد خدمات ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      if (!editing.name?.trim()) {
        setError("نام خدمت الزامی است");
        return;
      }
      await updateService(
        editing.id,
        {
          name: editing.name,
          price: Number(editing.price || 0),
        },
        token
      );
      setEditing(null);
      setSuccess("خدمت با موفقیت ویرایش شد.");
      showToast("خدمت با موفقیت ویرایش شد.");
      load();
    } catch (e) {
      setError("ویرایش خدمات ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
        return;
      }
      const ok = typeof window !== "undefined" ? window.confirm("آیا از حذف این خدمت مطمئن هستید؟") : true;
      if (!ok) return;
      await deleteService(id, token);
      setSuccess("خدمت حذف شد.");
      showToast("خدمت حذف شد.");
      load();
    } catch (e) {
      setError("حذف خدمات ناموفق بود");
    }
  }

  if (loading) return <LoadingSkeleton className="mx-auto" />;

  function toSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  }

  const filteredServices = services.filter((s) =>
    String(s.name || "").toLowerCase().includes(String(query || "").trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("manageServices")}</h2>
        <div className="flex gap-2 text-xs">
          {["CNC", "PVC", "Cutting", "Carpentry"].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-[var(--muted)]">{t("searchHint")}</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-64 bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-4 py-2 outline-none"
            placeholder={t("searchServices")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredServices.map((item) => (
          <a
            key={item.id}
            href={`/services/${toSlug(item.name)}`}
            className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-5 hover:bg-black/5 transition shadow-2xl"
          >
            <div className="text-sm text-[var(--muted)] mb-2">{t("services")}</div>
            <div className="text-xl font-extrabold text-amber-300">{item.name}</div>
          </a>
        ))}
        {filteredServices.length === 0 && (
          <div className="col-span-full text-center text-[var(--muted)]">{t("noInvoices")}</div>
        )}
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
        <form onSubmit={editing ? onUpdate : onCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("name")}</label>
            <input
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={editing ? editing.name : form.name}
              onChange={(e) =>
                editing ? setEditing({ ...editing, name: e.target.value }) : setForm({ ...form, name: e.target.value })
              }
              placeholder="مثال: CNC"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("price")}</label>
            <input
              type="number"
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={editing ? editing.price : form.price}
              onChange={(e) =>
                editing
                  ? setEditing({ ...editing, price: e.target.value })
                  : setForm({ ...form, price: e.target.value })
              }
              placeholder="افغانی"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-4 py-2 rounded-full w-full flex items-center justify-center gap-2"
            >
              {saving && <span className="spinner" />}
              {saving ? t("save") : editing ? t("editService") : t("addService")}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--panel-bg)]">
                <th className="p-2">#</th>
                <th className="p-2">{t("name")}</th>
                <th className="p-2">{t("price")}</th>
                <th className="p-2">{t("settings")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border-color)]">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{s.name}</td>
                  <td className="p-2 text-amber-300">?? {Number(s.price || 0).toLocaleString("fa-AF")}</td>
                  <td className="p-2 space-x-2 space-x-reverse">
                    <button
                      onClick={() => setEditing({ id: s.id, name: s.name, price: s.price })}
                      className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                    >
                      ✎ {t("editService")}
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                    >
                      🗑 {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-[var(--muted)] py-6">{t("noInvoices")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
