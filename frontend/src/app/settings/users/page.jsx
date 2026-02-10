"use client";
import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api";
import Link from "next/link";
import { useAdmin } from "@/lib/useAdmin";
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

export default function UsersSettingsPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { t } = useI18n();
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
        setError(t("loginRequired"));
        return;
      }
      const data = await getUsers(token);
      setUsers(data);
    } catch (e) {
      setError(t("errorUsersLoad") || "خطا در دریافت کاربران");
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
      showToast("کاربر با موفقیت ایجاد شد.");
      await load();
    } catch (e) {
      setError(t("errorUserCreate") || "ایجاد کاربر ناموفق بود");
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
      setError(t("errorUserUpdate") || "ویرایش کاربر ناموفق بود");
    }
  }

  async function onDelete(id) {
    try {
      const token = getToken();
      await deleteUser(id, token);
      await load();
    } catch (e) {
      setError(t("errorUserDelete") || "حذف کاربر ناموفق بود");
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
      <h1 className="text-2xl font-extrabold mb-2">{t("systemConfig")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">{t("createAccess")}</h3>
          <form onSubmit={onCreate} className="grid grid-cols-1 gap-3">
            {error && <div className="text-red-400 bg-red-500/10 rounded p-2 text-sm">{error}</div>}
            <input
              className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder={t("usernamePlaceholder")}
            />
            <input
              className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("email")}
            />
            <input
              type="password"
              className="bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-full px-3 py-2 outline-none"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={t("passwordPlaceholder")}
            />
            <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_staff} onChange={(e) => setForm({ ...form, is_staff: e.target.checked })} />
                {t("admin")}
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                {t("active")}
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-sky-500/80 hover:bg-sky-500 disabled:opacity-50 text-black px-5 py-2 rounded-full font-bold flex items-center justify-center gap-2"
            >
              {saving && <span className="spinner" />}
              {saving ? t("creating") : t("createUser")}
            </button>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">{t("userList")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--panel-bg)]">
                  <th className="p-2">#</th>
                  <th className="p-2">{t("usernamePlaceholder")}</th>
                  <th className="p-2">{t("email")}</th>
                  <th className="p-2">{t("admin")}</th>
                  <th className="p-2">{t("active")}</th>
                  <th className="p-2">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--border-color)]">
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
                      <button onClick={() => onDelete(u.id)} className="text-red-400 hover:text-red-300">{t("delete")}</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-[var(--muted)] py-6">{t("noUsers")}</td>
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
