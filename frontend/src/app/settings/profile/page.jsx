"use client";
import { useEffect, useState } from "react";
import { changePassword, getUserProfile, updateUserProfile } from "@/lib/api";
import Link from "next/link";
import { useAdmin } from "@/lib/useAdmin";
import { useI18n } from "@/components/i18n/I18nProvider";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";
import { showToast } from "@/lib/toast";

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-[var(--card-bg)] shadow-2xl border border-[var(--border-color)] p-6 ${className}`}>
      {children}
    </div>
  );
}

export default function ProfileSettingsPage() {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { t } = useI18n();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profile, setProfile] = useState({ display_name: "" });
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  useEffect(() => {
    setMounted(true);
    setHasToken(Boolean(getToken()));
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getUserProfile(token)
      .then((data) => {
        setProfile({
          display_name: data?.display_name || "",
        });
      })
      .catch(() => null);
  }, []);

  async function onSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    setSuccess("");
    try {
      const token = getToken();
      if (!token) {
        setError(t("loginRequired"));
        return;
      }
      const formData = new FormData();
      if (profile.display_name) formData.append("display_name", profile.display_name);
      const saved = await updateUserProfile(formData, token);
      setProfile({
        display_name: saved?.display_name || "",
      });
      if (typeof window !== "undefined") {
        const userKey = localStorage.getItem("username") || "";
        localStorage.setItem("display_name", saved?.display_name || "");
        if (userKey) {
          localStorage.setItem(`display_name:${userKey}`, saved?.display_name || "");
        }
        window.dispatchEvent(new CustomEvent("profile:updated", { detail: { display_name: saved?.display_name || "" } }));
      }
      const msg = t("profileSaved") || "پروفایل با موفقیت ذخیره شد";
      setSuccess(msg);
      showToast(msg);
    } catch (e) {
      setError(t("profileSaveError") || "ذخیره پروفایل ناموفق بود");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newPassword || newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    const token = getToken();
    if (!token) {
      setError(t("loginRequired"));
      return;
    }
    setSaving(true);
    try {
      await changePassword({ old_password: oldPassword, new_password: newPassword }, token);
      setSuccess(t("passwordChanged") || "رمز عبور با موفقیت تغییر کرد");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e?.message || t("passwordChangeError") || "تغییر رمز ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return <div>{t("loading")}</div>;

  if (!hasToken) {
    return (
      <div>
        <Card>
          <p className="mb-4">{t("loginRequired")}</p>
          <Link className="text-amber-300" href="/login">{t("backToLogin")}</Link>
        </Card>
      </div>
    );
  }

  if (adminLoading) return <LoadingSkeleton className="mx-auto" />;
  if (!isAdmin) return <div className="text-[var(--muted)]">{t("accessDeniedAdmin")}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold mb-2">{t("profileTitle")}</h1>

      <Card>
        <form onSubmit={onSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("displayName")}</label>
            <input
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded px-3 py-2 outline-none"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder={t("displayName")}
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black px-5 py-2 rounded font-bold flex items-center justify-center gap-2"
            >
              {savingProfile && <span className="spinner" />}
              {savingProfile ? t("saving") : t("saveProfile")}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {error && <div className="md:col-span-2 text-red-400 bg-red-500/10 rounded p-2 text-sm">{error}</div>}
          {success && <div className="md:col-span-2 text-emerald-400 bg-emerald-500/10 rounded p-2 text-sm">{success}</div>}

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("currentPassword")}</label>
            <input
              type="password"
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded px-3 py-2 outline-none"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("newPassword")}</label>
            <input
              type="password"
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded px-3 py-2 outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[var(--muted)]">{t("confirmPassword")}</label>
            <input
              type="password"
              className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded px-3 py-2 outline-none"
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
              className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-5 py-2 rounded font-bold flex items-center justify-center gap-2"
            >
              {saving && <span className="spinner" />}
              {saving ? t("saving") : t("changePassword")}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
