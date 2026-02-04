"use client";
import { useEffect, useState } from "react";
import { createProject, deleteProject, getProjects } from "@/lib/api";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", image: null, video: null });

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";
  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE || apiBase.replace(/\/api\/?$/, "");

  function resolveMedia(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${mediaBase}${url}`;
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) {
        setError("برای مدیریت پروژه‌ها ابتدا وارد شوید.");
        setLoading(false);
        return;
      }
      const data = await getProjects(token);
      setProjects(data);
    } catch (e) {
      setError("خطا در دریافت پروژه‌ها");
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
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.image) fd.append("image", form.image);
      if (form.video) fd.append("video", form.video);
      await createProject(fd, token);
      setForm({ title: "", image: null, video: null });
      load();
    } catch (e) {
      setError("ثبت پروژه ناموفق بود");
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
      await deleteProject(id, token);
      load();
    } catch (e) {
      setError("حذف پروژه ناموفق بود");
    }
  }

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">پروژه‌ها و گالری</h2>

      {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

      <Card>
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1 text-gray-400">عنوان پروژه</label>
            <input
              className="w-full bg-[#0b1220] border border-gray-700 rounded px-3 py-2 outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="مثال: دکوراسیون کابینت آشپزخانه"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">عکس پروژه</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-400">ویدیو پروژه</label>
            <input
              type="file"
              accept="video/*"
              className="w-full text-sm"
              onChange={(e) => setForm({ ...form, video: e.target.files?.[0] || null })}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 text-black font-bold px-4 py-2 rounded"
            >
              {saving ? "در حال ذخیره..." : "ثبت پروژه"}
            </button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card key={p.id} className="p-0 overflow-hidden">
            <div className="aspect-[4/3] bg-[#0b1220]">
              {p.image ? (
                <img src={resolveMedia(p.image)} alt={p.title} className="w-full h-full object-cover" />
              ) : p.video ? (
                <video src={resolveMedia(p.video)} controls className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">بدون رسانه</div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString("fa-AF")}</p>
              </div>
              <button onClick={() => onDelete(p.id)} className="text-xs text-red-400">حذف</button>
            </div>
          </Card>
        ))}
        {projects.length === 0 && (
          <div className="text-gray-500 text-sm">هیچ پروژه‌ای ثبت نشده است.</div>
        )}
      </div>
    </div>
  );
}
