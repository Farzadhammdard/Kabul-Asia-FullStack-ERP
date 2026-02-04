"use client";
import { useEffect, useState } from "react";
import { createService, deleteService, getServices, updateService } from "@/lib/api";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    try {
      const token = getToken();
      if (!token) {
        setError("ابتدا وارد شوید");
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
    try {
      const token = getToken();
      await updateService(
        editing.id,
        {
          name: editing.name,
          price: Number(editing.price || 0),
        },
        token
      );
      setEditing(null);
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
      await deleteService(id, token);
      load();
    } catch (e) {
      setError("حذف خدمات ناموفق بود");
    }
  }

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">مدیریت خدمات</h2>
        <div className="flex gap-2 text-xs">
          {["CNC", "PVC", "Cutting", "Carpentry"].map((tag) => (
            <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/5">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "CNC", href: "/services/cnc" },
          { name: "PVC", href: "/services/pvc" },
          { name: "Cutting", href: "/services/cutting" },
          { name: "Carpentry", href: "/services/carpentry" },
        ].map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="rounded-3xl bg-[#0e1627] border border-[#121a2c] p-5 hover:bg-[#121a2c] transition shadow-2xl"
          >
            <div className="text-sm text-gray-400 mb-2">پروژه‌های بخش</div>
            <div className="text-xl font-extrabold text-amber-300">{item.name}</div>
          </a>
        ))}
      </div>

      {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

      <Card>
        <form onSubmit={editing ? onUpdate : onCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 text-gray-400">نام خدمت</label>
            <input
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={editing ? editing.name : form.name}
              onChange={(e) =>
                editing ? setEditing({ ...editing, name: e.target.value }) : setForm({ ...form, name: e.target.value })
              }
              placeholder="مثال: CNC"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">قیمت</label>
            <input
              type="number"
              className="w-full bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={editing ? editing.price : form.price}
              onChange={(e) =>
                editing
                  ? setEditing({ ...editing, price: e.target.value })
                  : setForm({ ...form, price: e.target.value })
              }
              placeholder="AFN"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 text-black font-bold px-4 py-2 rounded-full w-full"
            >
              {saving ? "در حال ذخیره..." : editing ? "ثبت ویرایش" : "افزودن خدمت"}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="text-xs text-gray-400">
                انصراف
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-[#1e293b]">
                <th className="p-2">#</th>
                <th className="p-2">نام</th>
                <th className="p-2">قیمت</th>
                <th className="p-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-gray-800">
                  <td className="p-2">{s.id}</td>
                  <td className="p-2">{s.name}</td>
                  <td className="p-2 text-amber-300">AFN {Number(s.price || 0).toLocaleString("fa-AF")}</td>
                  <td className="p-2 space-x-2 space-x-reverse">
                    <button
                      onClick={() => setEditing({ id: s.id, name: s.name, price: s.price })}
                      className="text-sky-400 hover:text-sky-300"
                    >
                      ویرایش
                    </button>
                    <button onClick={() => onDelete(s.id)} className="text-red-400 hover:text-red-300">
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-6">خدمتی ثبت نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
