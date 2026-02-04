"use client";
import { useState } from "react";
import { changePassword } from "@/lib/api";
import Link from "next/link";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[#0e1627] shadow-2xl border border-[#121a2c] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function ProfileSettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newPassword || newPassword !== confirmPassword) {
      setError("رمزهای جدید با هم مطابقت ندارند");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("ابتدا وارد شوید");
      return;
    }
    setSaving(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword }, token);
      setSuccess("رمز عبور با موفقیت تغییر کرد");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError("تغییر رمز ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

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
      <h1 className="text-2xl font-extrabold mb-2">پروفایل من</h1>

      <Card>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {error && <div className="md:col-span-2 text-red-400 bg-red-500/10 rounded p-2 text-sm">{error}</div>}
          {success && <div className="md:col-span-2 text-emerald-400 bg-emerald-500/10 rounded p-2 text-sm">{success}</div>}

          <div>
            <label className="block text-sm mb-1 text-gray-400">رمز فعلی</label>
            <input
              type="password"
              className="w-full bg-[#0b1220] border border-gray-700 rounded px-3 py-2 outline-none"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">رمز جدید</label>
            <input
              type="password"
              className="w-full bg-[#0b1220] border border-gray-700 rounded px-3 py-2 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">تکرار رمز جدید</label>
            <input
              type="password"
              className="w-full bg-[#0b1220] border border-gray-700 rounded px-3 py-2 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-5 py-2 rounded font-bold"
            >
              {saving ? "در حال ذخیره..." : "تغییر رمز"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
