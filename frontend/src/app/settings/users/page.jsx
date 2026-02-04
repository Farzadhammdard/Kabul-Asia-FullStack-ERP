"use client";
import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api";
import Link from "next/link";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function UsersSettingsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ username: "", email: "", password: "", is_staff: false, is_active: true });

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
        setError("برای مشاهده این صفحه باید وارد شوید.");
        return;
      }
      const data = await getUsers(token);
      setUsers(data);
    } catch (e) {
      setError("خطا در دریافت کاربران");
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
      await createUser(
        {
          username: form.username,
          email: form.email,
          password: form.password,
          is_staff: form.is_staff,
          is_active: form.is_active,
        },
        token
      );
      setForm({ username: "", email: "", password: "", is_staff: false, is_active: true });
      await load();
    } catch (e) {
      setError("ایجاد کاربر ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function toggleUser(id, field, value) {
    try {
      const token = getToken();
      await updateUser(id, { [field]: value }, token);
      await load();
    } catch (e) {
      setError("ویرایش کاربر ناموفق بود");
    }
  }

  async function onDelete(id) {
    try {
      const token = getToken();
      await deleteUser(id, token);
      await load();
    } catch (e) {
      setError("حذف کاربر ناموفق بود");
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
      <h1 className="text-2xl font-extrabold mb-2">پیکربندی سیستم</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">ایجاد دسترسی جدید</h3>
          <form onSubmit={onCreate} className="grid grid-cols-1 gap-3">
            {error && <div className="text-red-400 bg-red-500/10 rounded p-2 text-sm">{error}</div>}
            <input
              className="bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="نام کاربری"
            />
            <input
              className="bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ایمیل"
            />
            <input
              type="password"
              className="bg-[#0b1220] border border-gray-700 rounded-full px-3 py-2 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="کلمه عبور"
            />
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_staff} onChange={(e) => setForm({ ...form, is_staff: e.target.checked })} />
                ادمین
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                فعال
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-sky-500/80 hover:bg-sky-500 disabled:opacity-50 text-black px-5 py-2 rounded-full font-bold"
            >
              {saving ? "در حال ایجاد..." : "ثبت کاربر در سیستم"}
            </button>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">فهرست کاربران</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-[#1e293b]">
                  <th className="p-2">#</th>
                  <th className="p-2">نام کاربری</th>
                  <th className="p-2">ایمیل</th>
                  <th className="p-2">ادمین</th>
                  <th className="p-2">فعال</th>
                  <th className="p-2">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800">
                    <td className="p-2">{u.id}</td>
                    <td className="p-2">{u.username}</td>
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">
                      <input type="checkbox" checked={u.is_staff} onChange={(e) => toggleUser(u.id, "is_staff", e.target.checked)} />
                    </td>
                    <td className="p-2">
                      <input type="checkbox" checked={u.is_active} onChange={(e) => toggleUser(u.id, "is_active", e.target.checked)} />
                    </td>
                    <td className="p-2">
                      <button onClick={() => onDelete(u.id)} className="text-red-400 hover:text-red-300">حذف</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-6">کاربری یافت نشد.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
